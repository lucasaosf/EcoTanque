import React, { useState } from 'react';
import { Crown, ExternalLink, X } from 'lucide-react';

interface BannerAnuncioProps {
  isPro: boolean;
  onAbrirModalPro: () => void;
}

// Anúncios automotivos de demonstração para o modo gratuito
const ANUNCIOS_DEMO = [
  {
    titulo: 'Youse Seguro Auto Digital',
    descricao: 'Pague por mês e personalize as coberturas para o seu carro com até 30% OFF.',
    cta: 'Cotar Agora',
    link: 'https://www.youse.com.br',
    patrocinado: 'Google AdMob • Parceiro Oficial',
  },
  {
    titulo: 'Pirelli & Michelin em Oferta',
    descricao: 'Troque seus pneus com montagem e balanceamento grátis na sua região.',
    cta: 'Ver Ofertas',
    link: 'https://www.google.com/search?q=pneus+em+promocao',
    patrocinado: 'Google AdMob • Automotivo',
  },
  {
    titulo: 'Porto Seguro Auto Fácil',
    descricao: 'Guincho ilimitado e socorro 24h a partir de R$ 49,90/mês. Proteja seu veículo.',
    cta: 'Conhecer',
    link: 'https://www.portoseguro.com.br',
    patrocinado: 'Google AdMob • Proteção Veicular',
  },
];

export const BannerAnuncio: React.FC<BannerAnuncioProps> = ({ isPro, onAbrirModalPro }) => {
  // Se for assinante PRO, NUNCA exibe anúncios
  if (isPro) {
    return null;
  }

  const [indiceAnuncio] = useState<number>(() => Math.floor(Math.random() * ANUNCIOS_DEMO.length));
  const [fechadoTemporario, setFechadoTemporario] = useState<boolean>(false);

  if (fechadoTemporario) {
    return null;
  }

  const anuncio = ANUNCIOS_DEMO[indiceAnuncio];

  return (
    <div className="w-full bg-slate-900 border-t border-slate-800 px-3 py-2 flex items-center justify-between gap-2 shadow-2xl relative z-20">
      {/* Botão de Fechar que convida a virar PRO */}
      <button
        onClick={() => {
          setFechadoTemporario(true);
        }}
        className="text-slate-500 hover:text-slate-300 p-1"
        title="Ocultar anúncio nesta sessão"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Conteúdo do Anúncio */}
      <a
        href={anuncio.link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-between gap-2 overflow-hidden group text-left"
      >
        <div className="overflow-hidden">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase font-bold tracking-wider px-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Anúncio
            </span>
            <h5 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 truncate transition-colors">
              {anuncio.titulo}
            </h5>
          </div>
          <p className="text-[10px] text-slate-400 truncate max-w-xs sm:max-w-md">
            {anuncio.descricao}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded text-[11px] font-bold shrink-0">
          <span>{anuncio.cta}</span>
          <ExternalLink className="w-3 h-3" />
        </div>
      </a>

      {/* Botão de Remover Anúncios (Atalho PRO) */}
      <button
        onClick={onAbrirModalPro}
        className="px-2 py-1 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] flex items-center gap-1 shrink-0 shadow-md hover:scale-102 transition-all"
        title="Assinar EcoTanque PRO para remover todos os anúncios"
      >
        <Crown className="w-3 h-3" />
        <span className="hidden xs:inline">Sem Anúncios</span>
      </button>
    </div>
  );
};
