import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
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
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // 1. Inicialização do Mapa com dupla camada de tiles (OpenStreetMap padrão + fallback)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Cria a instância do mapa
      const map = L.map(mapContainerRef.current, {
        center: [usuarioLat, usuarioLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // Camada oficial e ultra-estável do OpenStreetMap
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        crossOrigin: true,
      }).addTo(map);

      // Controle de zoom no canto superior direito
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);

      // Correção vital do Leaflet: Forçar re-cálculo de tamanho após renderização
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      setTimeout(() => {
        map.invalidateSize();
      }, 500);
    }

    // Monitora redimensionamento da tela (ex: rotação de tela do celular)
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

  // 2. Atualização do marcador do usuário e círculo de raio
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.invalidateSize();

    // Marcador do usuário (GPS)
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([usuarioLat, usuarioLng]);
    } else {
      const userIcon = L.divIcon({
        className: 'user-gps-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 bg-blue-500/40 rounded-full gps-pulse"></div>
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

      userMarkerRef.current.bindPopup('<strong>Você está aqui</strong>');
    }

    // Círculo de raio
    if (userCircleRef.current) {
      userCircleRef.current.setLatLng([usuarioLat, usuarioLng]);
      userCircleRef.current.setRadius(raioKm * 1000);
    } else {
      userCircleRef.current = L.circle([usuarioLat, usuarioLng], {
        radius: raioKm * 1000,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.08,
        weight: 1.5,
      }).addTo(map);
    }
  }, [usuarioLat, usuarioLng, raioKm]);

  // 3. Renderização dos Pontos dos Postos no Mapa e Auto-Enquadramento (Fit Bounds)
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

    const latLngsParaEnquadrar: [number, number][] = [];

    // Adiciona a posição do usuário para o cálculo do enquadramento
    latLngsParaEnquadrar.push([usuarioLat, usuarioLng]);

    postos.forEach((posto) => {
      const preco = posto.precos[combustivelSelecionado];
      if (preco === null || preco === undefined) return;

      latLngsParaEnquadrar.push([posto.lat, posto.lng]);

      const isMenor = Math.abs(preco - menorPreco) < 0.01;
      const isMaior = Math.abs(preco - maiorPreco) < 0.01 && precosValidos.length > 1;
      const isDestino = postoDestino?.id === posto.id;

      // Cores por faixa de preço
      let corBg = 'bg-slate-900 border-slate-700 text-white';
      if (isDestino) {
        corBg = 'bg-teal-500 border-white text-slate-950 ring-4 ring-teal-400/60 scale-110';
      } else if (isMenor) {
        corBg = 'bg-emerald-600 border-emerald-300 text-white ring-4 ring-emerald-500/40 scale-105';
      } else if (isMaior) {
        corBg = 'bg-rose-700 border-rose-400 text-white';
      } else {
        corBg = 'bg-amber-600 border-amber-300 text-white';
      }

      // Marcador interativo visual com preço
      const html = `
        <div class="custom-pin flex flex-col items-center cursor-pointer transition-transform active:scale-95">
          <div class="px-2.5 py-1 rounded-full border text-xs font-black shadow-2xl flex items-center gap-1 ${corBg}">
            ${isDestino ? '<span>🎯</span>' : isMenor ? '<span>★</span>' : '<span>⛽</span>'}
            <span>R$ ${preco.toFixed(2)}</span>
          </div>
          <div class="w-2.5 h-2.5 bg-slate-900 rotate-45 -mt-1.5 border-r border-b border-slate-700"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'fuel-marker-container',
        html: html,
        iconSize: [80, 36],
        iconAnchor: [40, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([posto.lat, posto.lng], {
        icon: customIcon,
        zIndexOffset: isDestino ? 1500 : isMenor ? 1200 : 500,
      });

      // Clique no marcador seleciona imediatamente o posto!
      marker.on('click', () => {
        if (onSelecionarPosto) {
          onSelecionarPosto(posto);
        }
      });

      // Popup informativo ao tocar
      const popupHtml = `
        <div class="p-2 min-w-[210px] font-sans text-slate-800">
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
              <span class="font-semibold text-slate-700">Preço:</span>
              <strong class="text-emerald-700 text-sm">R$ ${preco.toFixed(2)} / L</strong>
            </div>
            <button 
              id="btn-selecionar-posto-${posto.id}"
              class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded text-xs transition-colors shadow-sm"
            >
              Traçar Rota até Aqui ➔
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

    // Auto-Enquadramento inteligente:
    // Se o usuário selecionou uma rota ativa, enquadra na rota.
    // Se não, ajusta a câmera do mapa para mostrar o usuário E os postos disponíveis!
    if (!rotaAtiva && latLngsParaEnquadrar.length > 1) {
      try {
        const bounds = L.latLngBounds(latLngsParaEnquadrar);
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
        });
      } catch (e) {
        console.warn('Erro ao ajustar bounds do mapa', e);
      }
    }
  }, [postos, combustivelSelecionado, postoDestino, rotaAtiva, usuarioLat, usuarioLng, onSelecionarPosto]);

  // 4. Renderização do traçado de rota veicular ativa
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (rotaAtiva && rotaAtiva.coordenadasGeoJSON.length > 0) {
      const polyline = L.polyline(rotaAtiva.coordenadasGeoJSON, {
        color: '#059669', // Emerald vivo
        weight: 6,
        opacity: 0.9,
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

  return (
    <div className="relative w-full h-full min-h-[400px] flex-1">
      {/* Container do Mapa Leaflet */}
      <div 
        ref={mapContainerRef} 
        id="map-container"
        className="w-full h-full min-h-[400px] rounded-b-xl z-0" 
      />

      {/* Legenda flutuante no canto superior esquerdo */}
      <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-[11px] text-white shadow-xl flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <span>Mais Barato</span>
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

      {/* Botão de Centralizar nos Postos */}
      {postos.length > 0 && (
        <button
          onClick={() => {
            const map = mapInstanceRef.current;
            if (!map) return;
            const latLngs = postos.map((p) => [p.lat, p.lng] as [number, number]);
            latLngs.push([usuarioLat, usuarioLng]);
            map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40] });
          }}
          className="absolute top-3 right-14 z-10 bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-lg transition-colors flex items-center gap-1"
          title="Ver todos os postos na tela"
        >
          <span>🎯 Enquadrar Postos</span>
        </button>
      )}
    </div>
  );
};
