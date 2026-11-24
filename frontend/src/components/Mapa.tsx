import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Layers, LocateFixed, Crosshair, Map as MapIcon } from 'lucide-react';
import type { Posto, CombustivelTipo } from '../types';
import type { RotaDetalhada } from '../services/routingService';

interface MapaProps {
  postos: Posto[];
  usuarioLat: number;
  usuarioLng: number;
  raioKm: number;
  combustivelSelecionado: CombustivelTipo;
  onSelecionarPosto?: (posto: Posto) => void;
  postoDestino?: Posto | null;
  rotaAtiva?: RotaDetalhada | null;
}

// Configurações das camadas de satélite e ruas (Google Maps Hybrid & Vector)
const CAMADAS_MAPA = {
  satelite: {
    nome: 'Satélite',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: 'Google Satélite',
  },
  ruas: {
    nome: 'Ruas',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: 'Google Maps',
  },
};

export const Mapa: React.FC<MapaProps> = ({
  postos,
  usuarioLat,
  usuarioLng,
  raioKm,
  combustivelSelecionado,
  onSelecionarPosto,
  postoDestino,
  rotaAtiva,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Estados interativos solicitados pelo usuário
  const [tipoCamada, setTipoCamada] = useState<'satelite' | 'ruas'>('satelite'); // Inicia em satélite conforme solicitado
  const [mapaDeslocado, setMapaDeslocado] = useState<boolean>(false);

  // 1. Inicialização do mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [usuarioLat, usuarioLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // Cria a camada de satélite/ruas inicial
      const camadaConfig = CAMADAS_MAPA[tipoCamada];
      const tile = L.tileLayer(camadaConfig.url, {
        subdomains: camadaConfig.subdomains,
        maxZoom: camadaConfig.maxZoom,
      }).addTo(map);
      tileLayerRef.current = tile;

      // Controle de zoom no canto superior direito
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Camada para os marcadores de postos
      markersLayerRef.current = L.layerGroup().addTo(map);

      // Detecta quando o usuário arrasta/move o mapa para exibir o botão de recentralizar
      map.on('dragstart', () => {
        setMapaDeslocado(true);
      });

      mapInstanceRef.current = map;

      // Dispara cálculos de tamanho em múltiplos instantes para evitar mapa preto em WebViews
      setTimeout(() => map.invalidateSize(), 50);
      setTimeout(() => map.invalidateSize(), 200);
      setTimeout(() => map.invalidateSize(), 600);
      setTimeout(() => map.invalidateSize(), 1200);
    }

    const resizeObserver = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Alternância suave de Camada: Satélite vs Ruas
  const alternarCamada = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const proximaCamada = tipoCamada === 'satelite' ? 'ruas' : 'satelite';
    const config = CAMADAS_MAPA[proximaCamada];

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const novaCamada = L.tileLayer(config.url, {
      subdomains: config.subdomains,
      maxZoom: config.maxZoom,
    }).addTo(map);

    tileLayerRef.current = novaCamada;
    setTipoCamada(proximaCamada);
  }, [tipoCamada]);

  // 3. Função para Centralizar na Localização do Usuário
  const centralizarLocalizacao = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo([usuarioLat, usuarioLng], 15, {
      animate: true,
      duration: 1.0,
    });
    setMapaDeslocado(false);
  }, [usuarioLat, usuarioLng]);

  // 4. Atualização da posição do usuário (quando a cidade muda externamente ou GPS é obtido)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.invalidateSize();

    // Quando novas coordenadas chegam (ex: GPS ativado na abertura), centraliza o mapa no usuário
    if (!mapaDeslocado) {
      map.setView([usuarioLat, usuarioLng], 15);
    }

    // Atualiza marcador de GPS do usuário
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([usuarioLat, usuarioLng]);
    } else {
      const userIcon = L.divIcon({
        className: 'user-gps-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 bg-blue-500/50 rounded-full gps-pulse"></div>
            <div class="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      userMarkerRef.current = L.marker([usuarioLat, usuarioLng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      userMarkerRef.current.bindPopup('<strong>📍 Sua Localização Atual</strong>');
    }

    // Círculo translúcido do raio de busca
    if (userCircleRef.current) {
      userCircleRef.current.setLatLng([usuarioLat, usuarioLng]);
      userCircleRef.current.setRadius(raioKm * 1000);
    } else {
      userCircleRef.current = L.circle([usuarioLat, usuarioLng], {
        radius: raioKm * 1000,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.1,
        weight: 1.8,
      }).addTo(map);
    }
  }, [usuarioLat, usuarioLng, raioKm]);

  // 5. Renderização dos Marcadores de Todos os Postos no Mapa
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    map.invalidateSize();

    const precosValidos = postos
      .map((p) => p.precos[combustivelSelecionado])
      .filter((p): p is number => p !== null && p !== undefined);

    const menorPreco = precosValidos.length > 0 ? Math.min(...precosValidos) : 0;
    const maiorPreco = precosValidos.length > 0 ? Math.max(...precosValidos) : 0;

    const latLngsParaEnquadrar: [number, number][] = [[usuarioLat, usuarioLng]];

    postos.forEach((posto) => {
      const preco = posto.precos[combustivelSelecionado];
      if (preco === null || preco === undefined) return;

      latLngsParaEnquadrar.push([posto.lat, posto.lng]);

      const isMenor = Math.abs(preco - menorPreco) < 0.01;
      const isMaior = Math.abs(preco - maiorPreco) < 0.01 && precosValidos.length > 1;
      const isDestino = postoDestino?.id === posto.id;

      // Destaques de cores vibrantes para visualização clara no mapa de satélite
      let badgeEstilo = 'bg-slate-900/95 border-slate-600 text-white';
      let pinIcon = '⛽';

      if (isDestino) {
        badgeEstilo = 'bg-teal-500 border-white text-slate-950 ring-4 ring-teal-400/70 scale-110';
        pinIcon = '🎯';
      } else if (isMenor) {
        badgeEstilo = 'bg-emerald-600 border-emerald-300 text-white ring-4 ring-emerald-500/50 scale-105';
        pinIcon = '★';
      } else if (isMaior) {
        badgeEstilo = 'bg-rose-700 border-rose-400 text-white';
        pinIcon = '⛽';
      } else {
        badgeEstilo = 'bg-amber-600 border-amber-300 text-white';
        pinIcon = '⛽';
      }

      const html = `
        <div class="custom-pin flex flex-col items-center cursor-pointer transition-transform active:scale-95">
          <div class="px-2.5 py-1 rounded-full border text-xs font-black shadow-2xl flex items-center gap-1 ${badgeEstilo}">
            <span>${pinIcon}</span>
            <span>R$ ${preco.toFixed(2)}</span>
          </div>
          <div class="w-2.5 h-2.5 bg-slate-900 rotate-45 -mt-1.5 border-r border-b border-slate-700"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'fuel-marker-container',
        html: html,
        iconSize: [84, 38],
        iconAnchor: [42, 38],
        popupAnchor: [0, -38],
      });

      const marker = L.marker([posto.lat, posto.lng], {
        icon: customIcon,
        zIndexOffset: isDestino ? 1600 : isMenor ? 1300 : 600,
      });

      // Clique direto no pino seleciona o posto e traça a rota
      marker.on('click', () => {
        if (onSelecionarPosto) {
          onSelecionarPosto(posto);
        }
      });

      // Popup detalhado com botão de confirmação
      const popupHtml = `
        <div class="p-2.5 min-w-[220px] font-sans text-slate-800">
          <div class="flex items-center justify-between gap-1 border-b pb-1.5 mb-1.5">
            <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
              ${posto.bandeira}
            </span>
            ${isMenor ? '<span class="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">MAIS BARATO</span>' : ''}
          </div>

          <h3 class="font-bold text-sm text-slate-900 leading-tight">${posto.nome}</h3>
          <p class="text-[11px] text-slate-600 mt-0.5">${posto.endereco} - ${posto.bairro}</p>
          <p class="text-xs font-bold text-emerald-700 mt-1">${posto.distanciaKm ? `${posto.distanciaKm} km de você` : ''}</p>

          <div class="mt-2 pt-2 border-t flex flex-col gap-1.5">
            <div class="flex items-center justify-between text-xs bg-slate-100 p-1.5 rounded">
              <span class="font-semibold text-slate-700">Preço Selecionado:</span>
              <strong class="text-emerald-700 text-sm">R$ ${preco.toFixed(2)} / L</strong>
            </div>
            <button 
              id="btn-selecionar-posto-${posto.id}"
              class="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-md flex items-center justify-center gap-1"
            >
              Traçar Rota & Navegar ➔
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-selecionar-posto-${posto.id}`);
        if (btn && onSelecionarPosto) {
          btn.onclick = () => {
            onSelecionarPosto(posto);
            marker.closePopup();
          };
        }
      });

      layer.addLayer(marker);
    });

    // Enquadramento inicial nos postos apenas se não houver rota ativa
    if (!rotaAtiva && latLngsParaEnquadrar.length > 1 && !mapaDeslocado) {
      try {
        const bounds = L.latLngBounds(latLngsParaEnquadrar);
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
        });
      } catch (e) {
        console.warn('Erro fitBounds', e);
      }
    }
  }, [postos, combustivelSelecionado, postoDestino, rotaAtiva, usuarioLat, usuarioLng, onSelecionarPosto]);

  // 6. Traçado de rota veicular com Leaflet polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (rotaAtiva && rotaAtiva.coordenadasGeoJSON.length > 0) {
      const polyline = L.polyline(rotaAtiva.coordenadasGeoJSON, {
        color: '#10b981', // Verde esmeralda vivo sobre o satélite
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      routePolylineRef.current = polyline;

      map.fitBounds(polyline.getBounds(), {
        padding: [60, 60],
        maxZoom: 16,
      });
    }
  }, [rotaAtiva]);

  // 7. Função para Enquadrar Todos os Postos na Tela
  const enquadrarTodosPostos = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || postos.length === 0) return;

    const latLngs = postos.map((p) => [p.lat, p.lng] as [number, number]);
    latLngs.push([usuarioLat, usuarioLng]);
    map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40] });
    setMapaDeslocado(false);
  }, [postos, usuarioLat, usuarioLng]);

  return (
    <div className="relative w-full h-full min-h-[420px] flex-1">
      {/* Container Leaflet */}
      <div 
        ref={mapContainerRef} 
        id="map-container"
        className="w-full h-full min-h-[420px] rounded-b-xl" 
      />

      {/* Legenda de Cores Flutuante no Canto Superior Esquerdo */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-[11px] text-white shadow-2xl flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-400/40"></div>
          <span className="font-semibold">Mais Barato (★)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
          <span>Preço Médio</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
          <span>Mais Alto</span>
        </div>
      </div>

      {/* Barra de Controles Superiores Flutuantes (Direita) */}
      <div className="absolute top-3 right-14 z-[1000] flex items-center gap-2">
        {/* Botão de Alternar Camada (Satélite / Ruas) */}
        <button
          onClick={alternarCamada}
          className="bg-slate-900/95 hover:bg-slate-800 active:scale-95 text-cyan-300 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-xl backdrop-blur-md transition-all flex items-center gap-1.5"
          title={`Trocar para modo ${tipoCamada === 'satelite' ? 'Ruas' : 'Satélite'}`}
        >
          {tipoCamada === 'satelite' ? (
            <>
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Satélite Ativo</span>
            </>
          ) : (
            <>
              <MapIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mapa Ruas</span>
            </>
          )}
        </button>

        {/* Botão de Enquadrar Todos os Postos */}
        {postos.length > 0 && (
          <button
            onClick={enquadrarTodosPostos}
            className="bg-slate-900/95 hover:bg-slate-800 active:scale-95 text-emerald-400 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-xl backdrop-blur-md transition-all flex items-center gap-1"
            title="Ver todos os postos na tela"
          >
            <span>🎯 Enquadrar</span>
          </button>
        )}

        {/* Botão Fixo de Centralizar Localização */}
        <button
          onClick={centralizarLocalizacao}
          className="bg-slate-900/95 hover:bg-slate-800 active:scale-95 text-blue-400 border border-slate-700 p-2 rounded-lg shadow-xl backdrop-blur-md transition-all flex items-center justify-center"
          title="Minha Localização"
        >
          <LocateFixed className="w-4 h-4 text-blue-400" />
        </button>
      </div>

      {/* Botão Flutuante de Centralizar Minha Localização (quando o mapa for mexido/deslocado) */}
      {mapaDeslocado && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] animate-bounce">
          <button
            onClick={centralizarLocalizacao}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white border border-emerald-400/50 px-4 py-2 rounded-full font-bold text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 transition-all ring-4 ring-emerald-500/30"
          >
            <Crosshair className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Centralizar Minha Localização</span>
          </button>
        </div>
      )}
    </div>
  );
};
