import React, { useState } from 'react';
import type { Posto, CombustivelTipo } from '../types';
import { Navigation, Clock, ShieldCheck, ChevronDown, ChevronUp, Edit3, Award, ExternalLink } from 'lucide-react';

interface ListaPostosProps {
  postos: Posto[];
  combustivelSelecionado: CombustivelTipo;
  onEditarPosto: (posto: Posto) => void;
}

export const ListaPostos: React.FC<ListaPostosProps> = ({
  postos,
  combustivelSelecionado,
  onEditarPosto,
}) => {
  const [postoExpandido, setPostoExpandido] = useState<string | null>(null);

  if (postos.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <p className="text-slate-400 text-sm">Nenhum posto encontrado no raio selecionado.</p>
        <p className="text-slate-500 text-xs mt-1">Tente aumentar o raio de busca nos filtros acima.</p>
      </div>
    );
  }

  const precosValidos = postos
    .map((p) => p.precos[combustivelSelecionado])
    .filter((p): p is number => p !== null && p !== undefined);

  const precoMedio = precosValidos.length > 0
    ? precosValidos.reduce((a, b) => a + b, 0) / precosValidos.length
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-3">
      {postos.map((posto, index) => {
        const preco = posto.precos[combustivelSelecionado];
        if (preco === null || preco === undefined) return null;

        const isCampeao = index === 0;
        const economiaPorLitro = precoMedio - preco;
        const economiaTanque = economiaPorLitro > 0 ? economiaPorLitro * 50 : 0;
        const expandido = postoExpandido === posto.id;

        return (
          <div
            key={posto.id}
            className={`bg-slate-900 border rounded-xl overflow-hidden transition-all shadow-md ${
              isCampeao
                ? 'border-emerald-500/60 ring-2 ring-emerald-500/20 bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Banner de Campeão do Menor Preço */}
            {isCampeao && (
              <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1 text-xs font-bold flex items-center justify-between border-b border-emerald-500/30">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>OPÇÃO MAIS BARATA NA REGIÃO</span>
                </div>
                {economiaTanque > 0 && (
                  <span className="text-[11px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-extrabold">
                    Economize R$ {economiaTanque.toFixed(2)} / tanque
                  </span>
                )}
              </div>
            )}

            <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Informações do Posto */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}º
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {posto.bandeira}
                  </span>
                  <h3 className="font-bold text-slate-100 text-base truncate">{posto.nome}</h3>
                </div>

                <p className="text-xs text-slate-400 mt-1 truncate">
                  {posto.endereco} • {posto.bairro}, {posto.cidade} - {posto.uf}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <Navigation className="w-3 h-3" />
                    {posto.distanciaKm !== undefined ? `${posto.distanciaKm} km de você` : '--'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {posto.ultimaAtualizacao}
                  </span>
                  <span className="flex items-center gap-1 text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    {posto.fonte} ({posto.confiabilidade}%)
                  </span>
                </div>
              </div>

              {/* Bloco de Preço e Ações */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Preço por Litro
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-slate-400">R$</span>
                    <span
                      className={`text-2xl font-black tracking-tight ${
                        isCampeao ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {preco.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Botão de Rotas (Google Maps) */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${posto.lat},${posto.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:px-3 sm:py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                    title="Traçar rota no GPS"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ir</span>
                  </a>

                  {/* Botão de Waze */}
                  <a
                    href={`https://waze.com/ul?ll=${posto.lat},${posto.lng}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:px-3 sm:py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                    title="Abrir no Waze"
                  >
                    Waze
                  </a>

                  {/* Botão Atualizar Preço */}
                  <button
                    onClick={() => onEditarPosto(posto)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                    title="Informar alteração de preço"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Ver Todos os Preços */}
                  <button
                    onClick={() => setPostoExpandido(expandido ? null : posto.id)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    title="Ver todos os combustíveis deste posto"
                  >
                    {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Painel Expansível com Todos os Combustíveis do Posto */}
            {expandido && (
              <div className="bg-slate-950/70 border-t border-slate-800 p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Gasolina Comum</span>
                  <span className="font-bold text-slate-200 text-sm">
                    {posto.precos.gasolina_comum ? `R$ ${posto.precos.gasolina_comum.toFixed(2)}` : '--'}
                  </span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Etanol</span>
                  <span className="font-bold text-slate-200 text-sm">
                    {posto.precos.etanol ? `R$ ${posto.precos.etanol.toFixed(2)}` : '--'}
                  </span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Gasolina Aditivada</span>
                  <span className="font-bold text-slate-200 text-sm">
                    {posto.precos.gasolina_aditivada ? `R$ ${posto.precos.gasolina_aditivada.toFixed(2)}` : '--'}
                  </span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Diesel S10</span>
                  <span className="font-bold text-slate-200 text-sm">
                    {posto.precos.diesel_s10 ? `R$ ${posto.precos.diesel_s10.toFixed(2)}` : '--'}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
