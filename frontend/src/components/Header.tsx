import React from 'react';
import { MapPin, RefreshCw, Calculator, PlusCircle, Map as MapIcon, List, WifiOff, Crown } from 'lucide-react';

interface HeaderProps {
  cidadeAtual: string;
  carregando: boolean;
  online: boolean;
  sincronizando: boolean;
  onAtualizarLocalizacao: () => void;
  visualizacao: 'mapa' | 'lista';
  setVisualizacao: (v: 'mapa' | 'lista') => void;
  abrirCalculadora: () => void;
  abrirModalAtualizar: () => void;
  isPro?: boolean;
  abrirModalPro?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cidadeAtual,
  carregando,
  online,
  sincronizando,
  onAtualizarLocalizacao,
  visualizacao,
  setVisualizacao,
  abrirCalculadora,
  abrirModalAtualizar,
  isPro = false,
  abrirModalPro,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Logo, Nome e Status de Rede */}
        <div className="flex items-center gap-2.5">
          <img 
            src="/favicon.png" 
            alt="EcoTanque" 
            className="w-10 h-10 rounded-xl object-cover shadow-md shadow-emerald-500/20 border border-emerald-500/30" 
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight leading-none bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                EcoTanque
              </h1>
              {online ? (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Ao Vivo
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <WifiOff className="w-2.5 h-2.5" />
                  Offline
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-xs">{cidadeAtual}</span>
              {sincronizando && (
                <span className="text-[10px] text-emerald-400 italic font-semibold ml-1 animate-pulse">
                  (sincronizando...)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Alternar Mapa / Lista */}
          <div className="bg-slate-800 p-0.5 rounded-lg flex border border-slate-700">
            <button
              onClick={() => setVisualizacao('mapa')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                visualizacao === 'mapa'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Visualizar no Mapa"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mapa</span>
            </button>
            <button
              onClick={() => setVisualizacao('lista')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                visualizacao === 'lista'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Visualizar em Lista"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>

          {/* Botão Seja PRO / PRO Ativo */}
          {abrirModalPro && (
            <button
              onClick={abrirModalPro}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all shadow-md ${
                isPro
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 ring-2 ring-amber-400/50'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25'
              }`}
              title="Conhecer o EcoTanque PRO (Sem Anúncios)"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{isPro ? 'PRO Ativo' : 'Seja PRO'}</span>
            </button>
          )}

          {/* Calculadora Flex */}
          <button
            onClick={abrirCalculadora}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 hover:text-amber-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Calculadora Etanol vs Gasolina"
          >
            <Calculator className="w-4 h-4" />
            <span className="hidden md:inline">Flex</span>
          </button>

          {/* Atualizar Preço / QR Code */}
          <button
            onClick={abrirModalAtualizar}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all hover:scale-102"
            title="Informar Novo Preço ou NFC-e"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">+ Atualizar</span>
          </button>

          {/* Botão de Localização GPS */}
          <button
            onClick={onAtualizarLocalizacao}
            disabled={carregando || sincronizando}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            title="Atualizar GPS e Preços Agora"
          >
            <RefreshCw className={`w-4 h-4 ${carregando || sincronizando ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
