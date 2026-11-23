# ⛽ EcoTanque - Preço de Combustíveis Mais Baratos ao Vivo no Brasil

Aplicativo moderno e de alto desempenho projetado para localizar em tempo real os menores preços de combustíveis (**Gasolina Comum, Gasolina Aditivada, Etanol, Diesel S10 e GNV**) a partir da geolocalização do usuário em qualquer cidade do Brasil.

O projeto resolve o desafio de dados em tempo real por meio de uma **arquitetura híbrida**:
1. **Validação Fiscal em Tempo Real (NFC-e / SEFAZ):** Leitura e decodificação de Notas Fiscais Eletrônicas ao Consumidor (código de 44 dígitos).
2. **Consultas Geoespaciais Ultrarrápidas:** PostgreSQL com extensão **PostGIS** (`ST_DWithin`, índices `GIST`).
3. **Mapeamento ao Vivo:** OpenStreetMap (Overpass API) + Tiles de alto contraste com marcadores dinâmicos coloridos por ranking de preço.
4. **Calculadora Flex Inteligente:** Algoritmo que calcula se compensa abastecer com Etanol ou Gasolina com base na paridade e no consumo específico do veículo.

---

## 🏗️ Arquitetura do Sistema

```
                 [ Usuário (Web / Mobile PWA) ]
                               │
               GPS: Latitude, Longitude, Raio (km)
                               ▼
        ┌──────────────────────────────────────────────┐
        │        Frontend (React 19 + TypeScript)      │
        │        Tailwind CSS + Leaflet Maps           │
        └──────────────────────┬───────────────────────┘
                               │
                REST API / Supabase Client
                               ▼
        ┌──────────────────────────────────────────────┐
        │           Backend (Python FastAPI)           │
        │  - Algoritmo Geoespacial Haversine / PostGIS │
        │  - Decodificador NFC-e Modelo 65             │
        │  - Benchmark ANP por Estado                  │
        └──────────────────────┬───────────────────────┘
                               │
                PostgreSQL + PostGIS (EPSG:4326)
        ┌──────────────────────────────────────────────┐
        │  Tabelas: postos, precos, historico_precos   │
        │  Índice Espacial GIST em GEOMETRY(Point)     │
        └──────────────────────────────────────────────┘
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* Node.js v18+ e npm
* Python 3.10+ (opcional para rodar o backend local)
* Docker e Docker Compose (opcional para rodar com banco PostGIS)

---

### Opção 1: Rodar o Frontend Imediatamente (Modo Rápido / Standalone)

O frontend possui inteligência própria com fallback autônomo, dados de postos em capitais brasileiras, integração com OpenStreetMap e persistência local.

```bash
cd frontend
npm install
npm run dev
```

Abra seu navegador em: `http://localhost:5173`

* Dica: Permita o acesso à localização GPS no navegador ou use os botões de atalho no topo para testar instantaneamente em **São Paulo, Rio de Janeiro, Curitiba, Belo Horizonte, Brasília, Salvador, Porto Alegre ou Goiânia**.

---

### Opção 2: Rodar o Backend em Python (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

A API estará rodando em `http://localhost:8000`
Documentação interativa Swagger: `http://localhost:8000/docs`

#### Endpoints Principais:
* `GET /api/postos?lat={lat}&lng={lng}&raio_km={km}&combustivel={tipo}&ordem={preco|distancia}`: Retorna postos ordenados por preço ou distância.
* `POST /api/postos/{id}/preco`: Atualiza preço da bomba com validação colaborativa.
* `POST /api/nfce/validar`: Decodifica chave de 44 dígitos da NFC-e da SEFAZ.
* `GET /api/anp/benchmark/{uf}`: Preços médios de referência da ANP para o estado informado.

---

### Opção 3: Rodar a Stack Completa via Docker Compose

```bash
docker-compose up -d
```

Isso inicializa automaticamente:
* Banco PostgreSQL 16 com extensão **PostGIS** na porta `5432` com as tabelas criadas a partir de `database/schema.sql`.
* Backend FastAPI na porta `8000`.
* Frontend React na porta `5173`.

---

## 🗄️ Banco de Dados Geoespacial (PostGIS)

O arquivo `database/schema.sql` contém a estrutura completa para PostgreSQL / Supabase:

* **Extensão PostGIS:** Criação de pontos `GEOMETRY(Point, 4326)`.
* **Índices GIST:** Otimização para consultas de raio em milissegundos.
* **Função SQL `fn_buscar_postos_proximos`:** Busca geográfica nativa calculando distâncias exatas na projeção da Terra.

---

## 📦 Como Publicar no GitHub

Para subir este repositório no seu GitHub (`lucasaosf`):

1. Crie um novo repositório no seu GitHub com o nome `combustivel-brasil`.
2. No terminal, dentro da pasta `combustivel-brasil`, execute:

```bash
git add .
git commit -m "feat: lancamento inicial do EcoTanque Combustivel Brasil"
git branch -M main
git remote add origin https://github.com/lucasaosf/combustivel-brasil.git
git push -u origin main
```

---

## 📄 Licença
Distribuído sob a licença MIT.
