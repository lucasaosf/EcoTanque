import React from 'react';
import type { Posto, CombustivelTipo } from '../types';
import { obterEstiloBandeira } from '../types';
import type { RotaDetalhada } from '../services/routingService';
import { Navigation, Clock, MapPin, X, ExternalLink, Radio, Fuel } from 'lucide-react';

interface PainelNavegacaoProps {
  posto: Posto;
  rota: RotaDetalhada | null;
  combustivelSelecionado: CombustivelTipo;
  onEncerrarRota: () => void;
  rastreandoAoVivo: boolean;
  onAlternarRastreamento: () => void;
  estaOnline?: boolean;
}

export const PainelNavegacao: React.FC<PainelNavegacaoProps> = ({
  posto,
  rota,
  combustivelSelecionado,
  onEncerrarRota,
  rastreandoAoVivo,
  onAlternarRastreamento,
  estaOnline = true,
}) => {
  const preco = posto.precos[combustivelSelecionado];

  return (
    <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-[420px] z-20 bg-slate-900/95 backdrop-blur-xl border border-emerald-500/50 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
      {/* Topo do Card de Navegação */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500 rounded-xl text-slate-950 font-bold shadow-md shadow-emerald-500/30">
            <Navigation className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] uppercase font-black tracking-wide px-2 py-0.5 rounded shadow-sm shrink-0 ${obterEstiloBandeira(posto.bandeira).badge}`}>
                {obterEstiloBandeira(posto.bandeira).emoji} {posto.bandeira}
              </span>
              <span className="text-xs font-bold text-white truncate max-w-[200px]">
                {posto.nome}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[230px] mt-0.5">
              {posto.endereco} - {posto.bairro}
            </p>
          </div>
        </div>

        <button
          onClick={onEncerrarRota}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Encerrar Rota"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Métricas Principais: Tempo Estimado, Distância e Preço */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
          {/* Tempo Estimado */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Tempo</span>
            </div>
            <span className="text-xl font-black text-white">
              {rota ? `${rota.duracaoMinutos} min` : '--'}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {rota ? `Chegada às ${rota.horaEstimadaChegada}` : ''}
              {!estaOnline && <span className="text-amber-400 font-semibold ml-1">⚡ Offline</span>}
            </span>
          </div>

          {/* Distância Real por Rua */}
          <div className="text-center border-x border-slate-800">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
              <MapPin className="w-3 h-3 text-teal-400" />
              <span>Distância</span>
            </div>
            <span className="text-xl font-black text-white">
              {rota ? `${rota.distanciaKm} km` : `${posto.distanciaKm || '--'} km`}
            </span>
            <span className="text-[10px] text-emerald-400 block font-semibold">
              Malha Viária
            </span>
          </div>

          {/* Preço do Posto */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
              <Fuel className="w-3 h-3 text-amber-400" />
              <span>Valor</span>
            </div>
            <span className="text-xl font-black text-emerald-400">
              {preco ? `R$ ${preco.toFixed(2)}` : '--'}
            </span>
            <span className="text-[10px] text-slate-500 block">por litro</span>
          </div>
        </div>

        {/* Indicador de Rastreamento de GPS em Tempo Real */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {rastreandoAoVivo && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  rastreandoAoVivo ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              ></span>
            </span>
            <span className="text-slate-300 font-medium text-[11px]">
              {rastreandoAoVivo ? 'GPS em tempo real acompanhando' : 'GPS em espera'}
            </span>
          </div>

          <button
            onClick={onAlternarRastreamento}
            className="text-[11px] text-emerald-400 hover:underline font-semibold flex items-center gap-1"
          >
            <Radio className="w-3 h-3" />
            {rastreandoAoVivo ? 'Pausar' : 'Ativar'}
          </button>
        </div>

        {/* Botões de Ação para Google Maps e Waze */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${posto.lat},${posto.lng}&travelmode=driving`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all hover:scale-102"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Navegar no Maps
          </a>

          <a
            href={`https://waze.com/ul?ll=${posto.lat},${posto.lng}&navigate=yes`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-900/30 transition-all hover:scale-102"
          >
            Abrir no Waze
          </a>
        </div>
      </div>
    </div>
  );
};
