import React from 'react';
import type { CombustivelTipo, OrdemBusca } from '../types';
import { Flame, Zap, Truck, Wind, ArrowUpDown, SlidersHorizontal, TrendingDown } from 'lucide-react';

interface FiltrosProps {
  combustivelSelecionado: CombustivelTipo;
  onSelecionarCombustivel: (tipo: CombustivelTipo) => void;
  raioKm: number;
  onSelecionarRaio: (raio: number) => void;
  ordem: OrdemBusca;
  onSelecionarOrdem: (ordem: OrdemBusca) => void;
  menorPreco: number | null;
  precoMedio: number | null;
  totalPostos: number;
}

const COMBUSTIVEIS: { id: CombustivelTipo; label: string; icon: any; cor: string }[] = [
  { id: 'gasolina_comum', label: 'Gasolina', icon: Flame, cor: 'text-amber-400' },
  { id: 'etanol', label: 'Etanol', icon: Zap, cor: 'text-emerald-400' },
  { id: 'gasolina_aditivada', label: 'Aditivada', icon: Flame, cor: 'text-orange-400' },
  { id: 'diesel_s10', label: 'Diesel S10', icon: Truck, cor: 'text-blue-400' },
  { id: 'gnv', label: 'GNV', icon: Wind, cor: 'text-teal-400' },
];

const RAIOS = [2, 5, 10, 20, 50];

export const Filtros: React.FC<FiltrosProps> = ({
  combustivelSelecionado,
  onSelecionarCombustivel,
  raioKm,
  onSelecionarRaio,
  ordem,
  onSelecionarOrdem,
  menorPreco,
  precoMedio,
  totalPostos,
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 py-3 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Seletor de Combustíveis (Scroll horizontal em mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {COMBUSTIVEIS.map((c) => {
            const Icon = c.icon;
            const ativo = combustivelSelecionado === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelecionarCombustivel(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  ativo
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-102 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80 border border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${ativo ? 'text-slate-950' : c.cor}`} />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Linha com Raio, Ordenação e Métricas de Economia */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          {/* Seletor de Raio */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <SlidersHorizontal className="w-3 h-3 text-emerald-400" />
              Raio:
            </span>
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              {RAIOS.map((r) => (
                <button
                  key={r}
                  onClick={() => onSelecionarRaio(r)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    raioKm === r
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>

          {/* Ordenação */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={ordem}
              onChange={(e) => onSelecionarOrdem(e.target.value as OrdemBusca)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="preco">Menor Preço</option>
              <option value="distancia">Mais Próximo</option>
              <option value="custo_beneficio">Melhor Custo-Benefício</option>
            </select>
          </div>

          {/* Destaque de Preço e Economia */}
          {menorPreco && (
            <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-2.5 py-1 text-emerald-300">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Menor: <strong className="text-white">R$ {menorPreco.toFixed(2)}</strong>
              </span>
              {precoMedio && (
                <span className="text-[11px] text-emerald-400/80 hidden sm:inline">
                  (Média: R$ {precoMedio.toFixed(2)})
                </span>
              )}
              <span className="text-[10px] bg-emerald-500/20 px-1 rounded text-emerald-300">
                {totalPostos} postos
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
