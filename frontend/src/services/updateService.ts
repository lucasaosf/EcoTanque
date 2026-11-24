// Serviço de Verificação Automática de Atualizações e Conectividade
export const VERSAO_ATUAL_APP = '1.0.0';

export interface InfoAtualizacao {
  temAtualizacao: boolean;
  versaoNova?: string;
  nomeRelease?: string;
  notasVersao?: string;
  downloadUrl?: string;
  dataPublicacao?: string;
}

// Compara duas versões simples semver (ex: "1.0.1" > "1.0.0")
function ehVersaoMaisRecente(versaoRemota: string, versaoLocal: string): boolean {
  const limpaRemota = versaoRemota.replace(/^v/i, '').trim();
  const limpaLocal = versaoLocal.replace(/^v/i, '').trim();

  const partesRemota = limpaRemota.split('.').map(n => parseInt(n, 10) || 0);
  const partesLocal = limpaLocal.split('.').map(n => parseInt(n, 10) || 0);

  for (let i = 0; i < Math.max(partesRemota.length, partesLocal.length); i++) {
    const r = partesRemota[i] || 0;
    const l = partesLocal[i] || 0;
    if (r > l) return true;
    if (r < l) return false;
  }

  return false;
}

// Verifica no GitHub Releases se há uma nova versão do APK disponível
export async function verificarAtualizacaoDisponivel(): Promise<InfoAtualizacao> {
  if (!navigator.onLine) {
    return { temAtualizacao: false };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://api.github.com/repos/lucasaosf/EcoTanque/releases/latest', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const release = await res.json();
      const versaoRemota = release.tag_name || '';

      const temNova = ehVersaoMaisRecente(versaoRemota, VERSAO_ATUAL_APP);

      // Localiza o arquivo .apk nos assets da release
      const assetApk = (release.assets || []).find((a: any) =>
        a.name && a.name.endsWith('.apk')
      );

      const downloadUrl = assetApk
        ? assetApk.browser_download_url
        : `https://github.com/lucasaosf/EcoTanque/releases/download/${versaoRemota}/EcoTanque-Combustivel-Brasil.apk`;

      return {
        temAtualizacao: temNova,
        versaoNova: versaoRemota,
        nomeRelease: release.name || `EcoTanque ${versaoRemota}`,
        notasVersao: release.body || 'Correções e melhorias gerais no aplicativo.',
        downloadUrl: downloadUrl,
        dataPublicacao: release.published_at,
      };
    }
  } catch (err) {
    // Falha silenciosa para não incomodar o usuário caso esteja sem internet ou GitHub instável
    console.warn('Verificação de atualização em segundo plano indisponível', err);
  }

  return { temAtualizacao: false };
}

// Monitora quando a internet volta ou quando o usuário abre o app novamente
export function registrarListenersConexao(
  onVoltouOnline: () => void,
  onFicouOffline?: () => void
): () => void {
  const handleOnline = () => {
    console.log('Conexão restabelecida. Atualizando dados automaticamente...');
    onVoltouOnline();
  };

  const handleOffline = () => {
    console.log('Dispositivo ficou offline.');
    if (onFicouOffline) onFicouOffline();
  };

  const handleVisibilidade = () => {
    if (!document.hidden && navigator.onLine) {
      // Quando o usuário volta ao aplicativo após alternar de tela
      onVoltouOnline();
    }
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  document.addEventListener('visibilitychange', handleVisibilidade);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    document.removeEventListener('visibilitychange', handleVisibilidade);
  };
}
