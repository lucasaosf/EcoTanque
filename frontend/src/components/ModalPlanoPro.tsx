import React, { useState } from 'react';
import { 
  Crown, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Ban, 
  BellRing, 
  TrendingDown, 
  Zap 
} from 'lucide-react';
import { 
  PLANO_PRO_CONFIG, 
  assinarPlanoPro, 
  cancelarAssinaturaPro, 
  type InfoAssinatura 
} from '../services/subscriptionService';

interface ModalPlanoProProps {
  aberto: boolean;
  onFechar: () => void;
  assinatura: InfoAssinatura;
  onAtualizarAssinatura: () => void;
}

export const ModalPlanoPro: React.FC<ModalPlanoProProps> = ({
  aberto,
  onFechar,
  assinatura,
  onAtualizarAssinatura,
}) => {
  const [carregando, setCarregando] = useState<boolean>(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  if (!aberto) return null;

  const handleAssinar = async () => {
    setCarregando(true);
    const resultado = await assinarPlanoPro();
    setCarregando(false);

    if (resultado.sucesso) {
      setMensagemSucesso(resultado.mensagem);
      onAtualizarAssinatura();
      setTimeout(() => {
        setMensagemSucesso(null);
        onFechar();
      }, 2000);
    }
  };

  const handleCancelar = () => {
    if (confirm('Tem certeza de que deseja voltar ao plano gratuito com anúncios?')) {
      cancelarAssinaturaPro();
      onAtualizarAssinatura();
      onFechar();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl shadow-2xl p-6 text-white overflow-hidden">
        {/* Efeito Glow Dourado de Fundo */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Botão Fechar */}
        <button
          onClick={onFechar}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho do Plano */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/30 mb-3">
            <Crown className="w-8 h-8 font-black" />
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              Plano Exclusivo
            </span>
          </div>
          <h2 className="text-2xl font-black mt-2 tracking-tight">EcoTanque PRO</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            A ferramenta definitiva para motoristas de aplicativo, taxistas e frotistas economizarem de verdade.
          </p>
        </div>

        {/* Preço em Destaque */}
        <div className="bg-slate-800/80 border border-amber-500/30 rounded-xl p-4 text-center mb-5 backdrop-blur-sm shadow-inner">
          <span className="text-xs text-slate-400 block uppercase font-semibold">Assinatura Mensal</span>
          <div className="flex items-baseline justify-center gap-1 mt-1">
            <span className="text-3xl font-black text-amber-400">{PLANO_PRO_CONFIG.precoMensal}</span>
            <span className="text-xs text-slate-400 font-semibold">/ mês</span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block font-medium">
            Economize até R$ 350,00 por mês no combustível
          </span>
        </div>

        {/* Lista de Benefícios */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Ban className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">100% Sem Anúncios</h4>
              <p className="text-[11px] text-slate-400">Navegue no mapa e nas rotas com máxima velocidade e sem distrações.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Alertas de Queda de Preço</h4>
              <p className="text-[11px] text-slate-400">Seja notificado no celular assim que um posto próximo baixar o valor.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Controle de Custo / KM</h4>
              <p className="text-[11px] text-slate-400">Calculadora avançada de consumo para motoristas de Uber e 99.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Atualização Prioritária</h4>
              <p className="text-[11px] text-slate-400">Acesso antecipado a dados oficiais de notas fiscais (SEFAZ).</p>
            </div>
          </div>
        </div>

        {/* Mensagem de Sucesso */}
        {mensagemSucesso && (
          <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 text-center font-bold">
            {mensagemSucesso}
          </div>
        )}

        {/* Botão de Ação */}
        {assinatura.isPro ? (
          <div className="space-y-2">
            <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-center text-xs text-amber-300 font-bold flex items-center justify-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Sua Assinatura PRO está Ativa!</span>
            </div>
            <button
              onClick={handleCancelar}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs rounded-xl font-semibold transition-colors"
            >
              Cancelar Assinatura PRO
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleAssinar}
              disabled={carregando}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:brightness-110 active:scale-98 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{carregando ? 'Processando...' : 'Assinar EcoTanque PRO'}</span>
            </button>
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Processado com segurança pelo Google Play. Cancele quando quiser.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
