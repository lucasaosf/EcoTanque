/**
 * Serviço de Assinatura e Monetização do EcoTanque
 * Suporta Google Play Billing (In-App Purchases) e persistência local
 */

const STORAGE_ASSINATURA = 'ecotanque_assinatura_pro_v1';

export interface InfoAssinatura {
  isPro: boolean;
  tipo: 'free' | 'pro';
  dataInicio?: string;
  dataRenovacao?: string;
  planoId: string;
}

export const PLANO_PRO_CONFIG = {
  id: 'ecotanque_pro_mensal',
  nome: 'EcoTanque PRO',
  precoMensal: 'R$ 14,90',
  precoNumero: 14.90,
  beneficios: [
    {
      titulo: 'Zero Anúncios',
      descricao: 'Navegação 100% limpa, rápida e sem nenhuma interrupção publicitária.',
      icone: 'Ban',
    },
    {
      titulo: 'Alertas de Preço Baixo',
      descricao: 'Notificações imediatas quando postos próximos baixarem os preços.',
      icone: 'BellRing',
    },
    {
      titulo: 'Controle de Consumo & Custo/KM',
      descricao: 'Métricas avançadas para motoristas de aplicativo e frotistas maximizarem lucros.',
      icone: 'TrendingDown',
    },
    {
      titulo: 'Atualização Prioritária SEFAZ',
      descricao: 'Acesso imediato às notas fiscais eletrônicas com menor tempo de latência.',
      icone: 'Zap',
    },
    {
      titulo: 'Selo Exclusivo Motorista PRO',
      descricao: 'Destaque visual na comunidade e acesso antecipado a novas ferramentas.',
      icone: 'Crown',
    },
  ],
};

/**
 * Retorna o status atual de assinatura do usuário
 */
export function obterStatusAssinatura(): InfoAssinatura {
  try {
    const dados = localStorage.getItem(STORAGE_ASSINATURA);
    if (dados) {
      const parsed = JSON.parse(dados) as InfoAssinatura;
      return parsed;
    }
  } catch (e) {
    console.warn('Erro ao ler assinatura local', e);
  }

  return {
    isPro: false,
    tipo: 'free',
    planoId: 'free',
  };
}

/**
 * Ativa o Plano PRO do usuário (simulação ou pós-confirmação do Google Play Billing)
 */
export async function assinarPlanoPro(): Promise<{ sucesso: boolean; mensagem: string }> {
  try {
    // Quando em produção na Play Store, aqui é chamada a API do Google Play Billing:
    // await InAppPurchases.purchase({ productId: PLANO_PRO_CONFIG.id });

    const agora = new Date();
    const renovacao = new Date();
    renovacao.setMonth(renovacao.getMonth() + 1);

    const novaAssinatura: InfoAssinatura = {
      isPro: true,
      tipo: 'pro',
      dataInicio: agora.toISOString(),
      dataRenovacao: renovacao.toISOString(),
      planoId: PLANO_PRO_CONFIG.id,
    };

    localStorage.setItem(STORAGE_ASSINATURA, JSON.stringify(novaAssinatura));

    return {
      sucesso: true,
      mensagem: 'Parabéns! Você agora é um assinante EcoTanque PRO. Todos os anúncios foram removidos!',
    };
  } catch (error) {
    console.error('Erro ao assinar plano PRO', error);
    return {
      sucesso: false,
      mensagem: 'Não foi possível processar a assinatura no momento. Tente novamente.',
    };
  }
}

/**
 * Cancela a assinatura PRO voltando ao plano Free
 */
export function cancelarAssinaturaPro(): void {
  try {
    localStorage.removeItem(STORAGE_ASSINATURA);
  } catch (e) {
    console.warn('Erro ao cancelar assinatura', e);
  }
}
