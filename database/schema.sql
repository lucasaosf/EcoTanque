-- =========================================================================
-- BANCO DE DADOS GEOESPACIAL ECOTANQUE (POSTGRESQL + POSTGIS)
-- Compatível com Supabase, AWS RDS, Neon ou PostgreSQL Local
-- =========================================================================

-- 1. Habilita a extensão geoespacial PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Postos de Combustíveis do Brasil
CREATE TABLE IF NOT EXISTS postos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cnpj VARCHAR(14) UNIQUE,
    razao_social VARCHAR(255),
    nome_fantasia VARCHAR(255) NOT NULL,
    bandeira VARCHAR(50) DEFAULT 'Branca',
    endereco TEXT NOT NULL,
    bairro VARCHAR(100),
    municipio VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    cep VARCHAR(9),
    -- Campo geoespacial PostGIS (WGS84 - EPSG:4326)
    localizacao GEOMETRY(Point, 4326) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice Espacial GIST para buscas em milissegundos
CREATE INDEX IF NOT EXISTS idx_postos_localizacao ON postos USING GIST(localizacao);
CREATE INDEX IF NOT EXISTS idx_postos_uf_municipio ON postos(uf, municipio);

-- 3. Tabela de Preços Atuais dos Combustíveis
CREATE TABLE IF NOT EXISTS precos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    posto_id UUID NOT NULL REFERENCES postos(id) ON DELETE CASCADE,
    combustivel VARCHAR(30) NOT NULL, -- 'gasolina_comum', 'etanol', 'gasolina_aditivada', 'diesel_s10', 'gnv'
    valor_litro NUMERIC(6, 3) NOT NULL,
    fonte VARCHAR(30) NOT NULL, -- 'NFC-e (SEFAZ)', 'ANP Oficial', 'Colaborativo'
    confiabilidade INT DEFAULT 95, -- de 0 a 100%
    confirmacoes INT DEFAULT 1,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unq_posto_combustivel UNIQUE(posto_id, combustivel)
);

CREATE INDEX IF NOT EXISTS idx_precos_combustivel_valor ON precos(combustivel, valor_litro);

-- 4. Tabela de Histórico de Preços para Gráficos de Tendência
CREATE TABLE IF NOT EXISTS historico_precos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    posto_id UUID NOT NULL REFERENCES postos(id) ON DELETE CASCADE,
    combustivel VARCHAR(30) NOT NULL,
    valor_litro NUMERIC(6, 3) NOT NULL,
    fonte VARCHAR(30) NOT NULL,
    registrado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historico_posto_data ON historico_precos(posto_id, registrado_em DESC);

-- =========================================================================
-- FUNÇÃO GEOESPACIAL: Buscar postos por raio em metros ordenando por preço
-- =========================================================================
CREATE OR REPLACE FUNCTION fn_buscar_postos_proximos(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_raio_metros INT DEFAULT 5000,
    p_combustivel VARCHAR DEFAULT 'gasolina_comum',
    p_ordem VARCHAR DEFAULT 'preco'
)
RETURNS TABLE (
    id UUID,
    nome_fantasia VARCHAR,
    bandeira VARCHAR,
    endereco TEXT,
    bairro VARCHAR,
    municipio VARCHAR,
    uf CHAR(2),
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    distancia_km DOUBLE PRECISION,
    valor_litro NUMERIC,
    fonte VARCHAR,
    confiabilidade INT,
    atualizado_em TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
DECLARE
    ponto_origem GEOMETRY;
BEGIN
    ponto_origem := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326);

    RETURN QUERY
    SELECT 
        p.id,
        p.nome_fantasia,
        p.bandeira,
        p.endereco,
        p.bairro,
        p.municipio,
        p.uf,
        ST_Y(p.localizacao) AS lat,
        ST_X(p.localizacao) AS lng,
        ROUND((ST_Distance(p.localizacao::geography, ponto_origem::geography) / 1000.0)::numeric, 2)::DOUBLE PRECISION AS distancia_km,
        pr.valor_litro,
        pr.fonte,
        pr.confiabilidade,
        pr.atualizado_em
    FROM postos p
    INNER JOIN precos pr ON pr.posto_id = p.id AND pr.combustivel = p_combustivel
    WHERE ST_DWithin(p.localizacao::geography, ponto_origem::geography, p_raio_metros)
      AND p.ativo = TRUE
    ORDER BY
        CASE WHEN p_ordem = 'preco' THEN pr.valor_litro END ASC,
        CASE WHEN p_ordem = 'distancia' THEN ST_Distance(p.localizacao::geography, ponto_origem::geography) END ASC,
        pr.valor_litro ASC;
END;
$$;
