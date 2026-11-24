import React from 'react';
import type { InfoAtualizacao } from '../services/updateService';
import { Sparkles, Download, X } from 'lucide-react';

interface ModalAtualizacaoDisponivelProps {
  info: InfoAtualizacao;
  onFechar: () => void;
}

export const ModalAtualizacaoDisponivel: React.FC<ModalAtualizacaoDisponivelProps> = ({
  info,
  onFechar,
}) => {
  if (!info.temAtualizacao || !info.downloadUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5 space-y-4">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-base">Nova Versão Disponível!</h3>
                <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-black">
                  {info.versaoNova}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Uma atualização do EcoTanque está pronta para download.
              </p>
            </div>
          </div>

          <button
            onClick={onFechar}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Descrição / Notas da versão */}
        {info.notasVersao && (
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 max-h-32 overflow-y-auto no-scrollbar">
            <p className="font-semibold text-emerald-400 mb-1">Novidades desta versão:</p>
            <p className="whitespace-pre-line text-slate-400 text-[11px] leading-relaxed">
              {info.notasVersao}
            </p>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onFechar}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors border border-slate-700"
          >
            Mais Tarde
          </button>

          <a
            href={info.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onFechar}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/40 transition-all hover:scale-102"
          >
            <Download className="w-4 h-4" />
            Atualizar Agora
          </a>
        </div>
      </div>
    </div>
  );
};
