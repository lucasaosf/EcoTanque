import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Posto, CombustivelTipo, OrdemBusca } from './types';
import { 
  obterPostosCadastrados, 
  salvarPostos, 
  filtrarEOrdenarPostos, 
  buscarPostosReaisOSM 
} from './services/postoService';
import { calcularRotaVeicular, type RotaDetalhada } from './services/routingService';
import { 
  verificarAtualizacaoDisponivel, 
  registrarListenersConexao, 
  type InfoAtualizacao 
} from './services/updateService';
import { Header } from './components/Header';
import { Filtros } from './components/Filtros';
import { Mapa } from './components/Mapa';
import { ListaPostos } from './components/ListaPostos';
import { PainelNavegacao } from './components/PainelNavegacao';
import { CalculadoraFlex } from './components/CalculadoraFlex';
import { ModalAtualizarPreco } from './components/ModalAtualizarPreco';
import { ModalAtualizacaoDisponivel } from './components/ModalAtualizacaoDisponivel';
import { MapPin, Sparkles, AlertCircle, Navigation } from 'lucide-react';

const CIDADES_TESTE = [
  { nome: 'São Paulo (SP)', lat: -23.5682, lng: -46.6534 },
  { nome: 'Rio de Janeiro (RJ)', lat: -22.9436, lng: -43.1812 },
  { nome: 'Curitiba (PR)', lat: -25.4439, lng: -49.2891 },
  { nome: 'Belo Horizonte (MG)', lat: -19.9388, lng: -43.9332 },
  { nome: 'Brasília (DF)', lat: -15.8234, lng: -47.9255 },
  { nome: 'Salvador (BA)', lat: -12.9815, lng: -38.4552 },
  { nome: 'Porto Alegre (RS)', lat: -30.0245, lng: -51.2023 },
  { nome: 'Goiânia (GO)', lat: -16.7118, lng: -49.2711 },
];

export const App: React.FC = () => {
  // Posição do usuário
  const [lat, setLat] = useState<number>(-23.5682);
  const [lng, setLng] = useState<number>(-46.6534);
  const [cidadeNome, setCidadeNome] = useState<string>('São Paulo (SP)');
  const [carregandoGPS, setCarregandoGPS] = useState<boolean>(false);
  const [mensagemGPS, setMensagemGPS] = useState<string | null>(null);
  const [rastreandoAoVivo, setRastreandoAoVivo] = useState<boolean>(false);

  // Status de Conectividade e Auto-Sincronização
  const [estaOnline, setEstaOnline] = useState<boolean>(navigator.onLine);
  const [sincronizandoDados, setSincronizandoDados] = useState<boolean>(false);
  const [infoAtualizacao, setInfoAtualizacao] = useState<InfoAtualizacao | null>(null);

  // Filtros
  const [combustivel, setCombustivel] = useState<CombustivelTipo>('gasolina_comum');
  const [raioKm, setRaioKm] = useState<number>(5);
  const [ordem, setOrdem] = useState<OrdemBusca>('preco');
  const [visualizacao, setVisualizacao] = useState<'mapa' | 'lista'>('mapa');

  // Dados dos Postos
  const [postos, setPostos] = useState<Posto[]>(obterPostosCadastrados());
  const [postoParaEditar, setPostoParaEditar] = useState<Posto | null>(null);

  // Rota e Posto Selecionado
  const [postoDestino, setPostoDestino] = useState<Posto | null>(null);
  const [rotaAtiva, setRotaAtiva] = useState<RotaDetalhada | null>(null);

  // Modais
  const [modalCalculadoraAberto, setModalCalculadoraAberto] = useState<boolean>(false);
  const [modalAtualizarAberto, setModalAtualizarAberto] = useState<boolean>(false);

  const watchIdRef = useRef<number | null>(null);

  // Selecionar posto e traçar rota viária com tempo estimado (ETA)
  const tracarRota = useCallback(async (posto: Posto, userLat: number, userLng: number) => {
    setPostoDestino(posto);
    setVisualizacao('mapa');
    const rota = await calcularRotaVeicular(userLat, userLng, posto.lat, posto.lng);
    setRotaAtiva(rota);
  }, []);

  // Sincronização Automática dos Dados e Preços
  const sincronizarDadosAutomaticamente = useCallback(async (forcarGPS = false) => {
    if (!navigator.onLine) {
      setEstaOnline(false);
      return;
    }

    setEstaOnline(true);
    setSincronizandoDados(true);

    // 1. Verifica se há nova versão do APK disponível no GitHub
    try {
      const update = await verificarAtualizacaoDisponivel();
      if (update.temAtualizacao) {
        setInfoAtualizacao(update);
      }
    } catch (e) {
      console.warn('Erro ao checar atualizacao de versao', e);
    }

    // 2. Se o usuário estiver usando GPS ou forçado, atualiza os postos locais
    if (forcarGPS || cidadeNome === 'Sua Localização GPS') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const userLat = pos.coords.latitude;
            const userLng = pos.coords.longitude;
            setLat(userLat);
            setLng(userLng);
            setCidadeNome('Sua Localização GPS');

            const postosLocais = await buscarPostosReaisOSM(userLat, userLng, raioKm);
            if (postosLocais.length > 0) {
              setPostos((anteriores) => {
                const combinados = [...postosLocais, ...anteriores.filter(a => !postosLocais.some(b => b.id === a.id))];
                salvarPostos(combinados);
                return combinados;
              });
            }
            setSincronizandoDados(false);
          },
          () => setSincronizandoDados(false),
          { timeout: 8000, enableHighAccuracy: true }
        );
        return;
      }
    }

    setSincronizandoDados(false);
  }, [cidadeNome, raioKm]);

  // Listener para quando o app volta a ter internet ou quando o usuário abre o app novamente
  useEffect(() => {
    // Executa sincronização inicial
    sincronizarDadosAutomaticamente(false);

    // Registra monitoramento de conexão automática
    const desinscrever = registrarListenersConexao(
      () => {
        // Ao voltar online ou abrir novamente com internet
        setEstaOnline(true);
        sincronizarDadosAutomaticamente(false);
      },
      () => {
        // Ao ficar offline
        setEstaOnline(false);
      }
    );

    return () => desinscrever();
  }, [sincronizarDadosAutomaticamente]);

  // Obter localização manual via GPS ao clicar no botão
  const obterLocalizacaoGPS = () => {
    if (!navigator.geolocation) {
      setMensagemGPS('Geolocalização não suportada no seu navegador.');
      return;
    }

    setCarregandoGPS(true);
    setMensagemGPS(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setLat(userLat);
        setLng(userLng);
        setCidadeNome('Sua Localização GPS');
        setRastreandoAoVivo(true);
        setCarregandoGPS(false);

        const postosLocais = await buscarPostosReaisOSM(userLat, userLng, raioKm);
        if (postosLocais.length > 0) {
          setPostos((anteriores) => {
            const combinados = [...postosLocais, ...anteriores.filter(a => !postosLocais.some(b => b.id === a.id))];
            salvarPostos(combinados);
            return combinados;
          });
        }
      },
      (err) => {
        console.warn('GPS negado ou indisponível', err);
        setMensagemGPS('Permissão de GPS não concedida. Toque em uma cidade acima para testar.');
        setCarregandoGPS(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Rastreamento Contínuo quando ativado
  useEffect(() => {
    if (!navigator.geolocation || !rastreandoAoVivo) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const novoLat = pos.coords.latitude;
        const novoLng = pos.coords.longitude;

        setLat(novoLat);
        setLng(novoLng);

        if (postoDestino) {
          tracarRota(postoDestino, novoLat, novoLng);
        }
      },
      (e) => console.warn('Erro GPS watcher', e),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [rastreandoAoVivo, postoDestino, tracarRota]);

  // Postos filtrados e ordenados
  const postosProcessados = useMemo(() => {
    return filtrarEOrdenarPostos(postos, {
      lat,
      lng,
      raioKm,
      combustivel,
      ordem,
    });
  }, [postos, lat, lng, raioKm, combustivel, ordem]);

  // Estatísticas de menor preço e média
  const { menorPreco, precoMedio } = useMemo(() => {
    const precos = postosProcessados
      .map((p) => p.precos[combustivel])
      .filter((p): p is number => p !== null && p !== undefined);

    if (precos.length === 0) return { menorPreco: null, precoMedio: null };

    const menor = Math.min(...precos);
    const media = precos.reduce((a, b) => a + b, 0) / precos.length;
    return { menorPreco: menor, precoMedio: media };
  }, [postosProcessados, combustivel]);

  // Salvar novo preço
  const handleSalvarPreco = (
    postoId: string,
    combustivelTipo: CombustivelTipo,
    novoPreco: number,
    fonte: Posto['fonte']
  ) => {
    setPostos((anteriores) => {
      const atualizados = anteriores.map((p) => {
        if (p.id === postoId) {
          return {
            ...p,
            precos: {
              ...p.precos,
              [combustivelTipo]: novoPreco,
            },
            ultimaAtualizacao: 'agora mesmo',
            fonte: fonte,
            confiabilidade: fonte === 'NFC-e (SEFAZ)' ? 100 : Math.min(p.confiabilidade + 5, 100),
            confirmacoes: p.confirmacoes + 1,
          };
        }
        return p;
      });
      salvarPostos(atualizados);
      return atualizados;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Alerta de GPS */}
      {mensagemGPS && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{mensagemGPS}</span>
          </div>
          <button onClick={() => setMensagemGPS(null)} className="font-bold underline text-[11px]">
            Fechar
          </button>
        </div>
      )}

      {/* Header Principal com Status de Rede e Auto-Sync */}
      <Header
        cidadeAtual={cidadeNome}
        carregando={carregandoGPS}
        online={estaOnline}
        sincronizando={sincronizandoDados}
        onAtualizarLocalizacao={obterLocalizacaoGPS}
        visualizacao={visualizacao}
        setVisualizacao={setVisualizacao}
        abrirCalculadora={() => setModalCalculadoraAberto(true)}
        abrirModalAtualizar={() => {
          setPostoParaEditar(null);
          setModalAtualizarAberto(true);
        }}
      />

      {/* Seletor Rápido de Cidades Brasileiras */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 text-xs">
        <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 shrink-0">
          <MapPin className="w-3 h-3 text-emerald-400" />
          Testar Cidade:
        </span>
        {CIDADES_TESTE.map((c) => {
          const ativo = cidadeNome === c.nome;
          return (
            <button
              key={c.nome}
              onClick={() => {
                setLat(c.lat);
                setLng(c.lng);
                setCidadeNome(c.nome);
                setRastreandoAoVivo(false);
                setPostoDestino(null);
                setRotaAtiva(null);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-all ${
                ativo
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {c.nome}
            </button>
          );
        })}
      </div>

      {/* Filtros e Métricas */}
      <Filtros
        combustivelSelecionado={combustivel}
        onSelecionarCombustivel={setCombustivel}
        raioKm={raioKm}
        onSelecionarRaio={setRaioKm}
        ordem={ordem}
        onSelecionarOrdem={setOrdem}
        menorPreco={menorPreco}
        precoMedio={precoMedio}
        totalPostos={postosProcessados.length}
      />

      {/* Conteúdo: Alternância entre Mapa e Lista */}
      <main className="flex-1 relative flex flex-col w-full h-[calc(100vh-210px)] min-h-[460px]">
        {visualizacao === 'mapa' ? (
          <div className="relative w-full h-full flex-1 flex flex-col">
            <Mapa
              postos={postosProcessados}
              usuarioLat={lat}
              usuarioLng={lng}
              raioKm={raioKm}
              combustivelSelecionado={combustivel}
              onSelecionarPosto={(posto) => tracarRota(posto, lat, lng)}
              postoDestino={postoDestino}
              rotaAtiva={rotaAtiva}
            />

            {/* Painel de Navegação Ativa (quando um posto é clicado) */}
            {postoDestino ? (
              <PainelNavegacao
                posto={postoDestino}
                rota={rotaAtiva}
                combustivelSelecionado={combustivel}
                onEncerrarRota={() => {
                  setPostoDestino(null);
                  setRotaAtiva(null);
                }}
                rastreandoAoVivo={rastreandoAoVivo}
                onAlternarRastreamento={() => setRastreandoAoVivo(!rastreandoAoVivo)}
              />
            ) : (
              /* Card Flutuante com o Posto Mais Barato */
              postosProcessados.length > 0 && postosProcessados[0].precos[combustivel] && (
                <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-10 bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 rounded-xl p-3 shadow-2xl">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Mais Barato Agora
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {postosProcessados[0].distanciaKm} km de você
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm truncate max-w-[200px]">
                        {postosProcessados[0].nome}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {postosProcessados[0].endereco}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Litro</span>
                      <span className="text-xl font-black text-emerald-400">
                        R$ {postosProcessados[0].precos[combustivel]?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => tracarRota(postosProcessados[0], lat, lng)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg text-center transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-900/30"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Traçar Rota & Tempo (ETA)
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <ListaPostos
            postos={postosProcessados}
            combustivelSelecionado={combustivel}
            onEditarPosto={(posto) => {
              setPostoParaEditar(posto);
              setModalAtualizarAberto(true);
            }}
            onSelecionarPostoParaNavegar={(posto) => tracarRota(posto, lat, lng)}
          />
        )}
      </main>

      {/* Modais */}
      <CalculadoraFlex
        aberto={modalCalculadoraAberto}
        onFechar={() => setModalCalculadoraAberto(false)}
        precoGasolinaInicial={menorPreco || 5.59}
        precoEtanolInicial={postosProcessados[0]?.precos.etanol || 3.59}
      />

      <ModalAtualizarPreco
        aberto={modalAtualizarAberto}
        onFechar={() => {
          setModalAtualizarAberto(false);
          setPostoParaEditar(null);
        }}
        postos={postosProcessados}
        postoSelecionado={postoParaEditar}
        onSalvarPreco={handleSalvarPreco}
      />

      {/* Modal Automático de Nova Versão Encontrada */}
      {infoAtualizacao && (
        <ModalAtualizacaoDisponivel
          info={infoAtualizacao}
          onFechar={() => setInfoAtualizacao(null)}
        />
      )}
    </div>
  );
};

export default App;
