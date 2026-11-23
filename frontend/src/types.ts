export type CombustivelTipo = 
  | 'gasolina_comum' 
  | 'gasolina_aditivada' 
  | 'etanol' 
  | 'diesel_s10' 
  | 'gnv';

export type Bandeira = 'Petrobras' | 'Shell' | 'Ipiranga' | 'Ale' | 'Branca' | 'Outras';

export interface PrecosPosto {
  gasolina_comum?: number | null;
  gasolina_aditivada?: number | null;
  etanol?: number | null;
  diesel_s10?: number | null;
  gnv?: number | null;
}

export interface Posto {
  id: string;
  nome: string;
  bandeira: Bandeira;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  lat: number;
  lng: number;
  precos: PrecosPosto;
  ultimaAtualizacao: string;
  fonte: 'NFC-e (SEFAZ)' | 'Colaborativo' | 'ANP Oficial';
  distanciaKm?: number;
  confiabilidade: number; // 0 a 100%
  confirmacoes: number;
}

export type OrdemBusca = 'preco' | 'distancia' | 'custo_beneficio';

export interface ParametrosBusca {
  lat: number;
  lng: number;
  raioKm: number;
  combustivel: CombustivelTipo;
  ordem: OrdemBusca;
}

export interface RegraCombustivelMeta {
  nome: string;
  sigla: string;
  cor: string;
  unidade: string;
}
