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

export interface EstiloBandeira {
  badge: string;
  pinBadge: string;
  nomeCurto: string;
  corPrincipal: string;
  emoji: string;
}

export function obterEstiloBandeira(bandeira: string): EstiloBandeira {
  const b = (bandeira || '').toLowerCase();
  if (b.includes('petrobras') || b.includes('br')) {
    return {
      badge: 'bg-emerald-950 text-yellow-300 border border-emerald-500/50 font-black',
      pinBadge: 'bg-emerald-800 text-yellow-300 border-yellow-400 font-black',
      nomeCurto: 'BR',
      corPrincipal: '#059669',
      emoji: '🟢',
    };
  }
  if (b.includes('shell')) {
    return {
      badge: 'bg-yellow-400 text-red-700 border border-red-500 font-black',
      pinBadge: 'bg-yellow-400 text-red-700 border-red-500 font-black',
      nomeCurto: 'Shell',
      corPrincipal: '#eab308',
      emoji: '🟡',
    };
  }
  if (b.includes('ipiranga')) {
    return {
      badge: 'bg-blue-600 text-yellow-300 border border-blue-400 font-black',
      pinBadge: 'bg-blue-600 text-yellow-300 border-yellow-400 font-black',
      nomeCurto: 'Ipiranga',
      corPrincipal: '#2563eb',
      emoji: '🔵',
    };
  }
  if (b.includes('ale')) {
    return {
      badge: 'bg-red-600 text-white border border-red-400 font-black',
      pinBadge: 'bg-red-600 text-white border-red-300 font-black',
      nomeCurto: 'Ale',
      corPrincipal: '#e11d48',
      emoji: '🔴',
    };
  }
  if (b.includes('total')) {
    return {
      badge: 'bg-rose-700 text-white border border-rose-500 font-black',
      pinBadge: 'bg-rose-700 text-white border-rose-400 font-black',
      nomeCurto: 'Total',
      corPrincipal: '#be123c',
      emoji: '🔴',
    };
  }
  return {
    badge: 'bg-slate-800 text-slate-200 border border-slate-600 font-black',
    pinBadge: 'bg-slate-800 text-slate-200 border-slate-600 font-black',
    nomeCurto: 'Branca',
    corPrincipal: '#64748b',
    emoji: '⚪',
  };
}
