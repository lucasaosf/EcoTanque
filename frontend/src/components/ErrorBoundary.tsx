import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'Erro inesperado',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Falha segura capturada pelo ErrorBoundary do EcoTanque:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Sessão Protegida com Segurança</h2>
              <p className="text-xs text-slate-400">
                O aplicativo detectou uma instabilidade temporária e isolou o processo para garantir a integridade dos seus dados e do seu dispositivo.
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-900/30"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar Aplicativo com Segurança
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
