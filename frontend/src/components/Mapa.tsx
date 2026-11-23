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

  // Inicialização do Mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [usuarioLat, usuarioLng],
        zoom: 14,
        zoomControl: false,
      });

      // Layer de mapa CartoDB Voyager de alta legibilidade
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      // Controle de zoom no canto superior direito
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Atualização da posição do usuário em tempo real
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Atualiza ou cria o marcador do usuário
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([usuarioLat, usuarioLng]);
    } else {
      const userIcon = L.divIcon({
        className: 'user-gps-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 bg-emerald-500/30 rounded-full gps-pulse"></div>
            <div class="w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-lg"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      userMarkerRef.current = L.marker([usuarioLat, usuarioLng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      userMarkerRef.current.bindPopup('<strong class="text-xs">Você está aqui (GPS Ativo)</strong>');
    }

    // Atualiza círculo do raio
    if (userCircleRef.current) {
      userCircleRef.current.setLatLng([usuarioLat, usuarioLng]);
      userCircleRef.current.setRadius(raioKm * 1000);
    } else {
      userCircleRef.current = L.circle([usuarioLat, usuarioLng], {
        radius: raioKm * 1000,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.06,
        weight: 1.5,
        dashArray: '4, 4',
      }).addTo(map);
    }

    // Se NÃO estiver com rota ativa, acompanha o centro no usuário
    if (!postoDestino) {
      map.setView([usuarioLat, usuarioLng], map.getZoom() || 14);
    }
  }, [usuarioLat, usuarioLng, raioKm, postoDestino]);

  // Renderização da Rota Viária Ativa no Mapa
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove rota anterior se existir
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (rotaAtiva && rotaAtiva.coordenadasGeoJSON.length > 0) {
      // Linha de rota com estilo neon / destaque
      const polyline = L.polyline(rotaAtiva.coordenadasGeoJSON, {
        color: '#059669', // Emerald-600
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      routePolylineRef.current = polyline;

      // Ajusta o zoom do mapa para enquadrar a rota inteira perfeitamente
      map.fitBounds(polyline.getBounds(), {
        padding: [60, 60],
        maxZoom: 16,
      });
    }
  }, [rotaAtiva]);

  // Marcadores de Postos
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const precosValidos = postos
      .map((p) => p.precos[combustivelSelecionado])
      .filter((p): p is number => p !== null && p !== undefined);

    const menorPreco = precosValidos.length > 0 ? Math.min(...precosValidos) : 0;
    const maiorPreco = precosValidos.length > 0 ? Math.max(...precosValidos) : 0;

    postos.forEach((posto) => {
      const preco = posto.precos[combustivelSelecionado];
      if (preco === null || preco === undefined) return;

      const isMenor = Math.abs(preco - menorPreco) < 0.01;
      const isMaior = Math.abs(preco - maiorPreco) < 0.01 && precosValidos.length > 1;
      const isDestino = postoDestino?.id === posto.id;

      let corBg = 'bg-slate-900 border-slate-700 text-white';

      if (isDestino) {
        corBg = 'bg-teal-500 border-white text-slate-950 ring-4 ring-teal-400/50 scale-110';
      } else if (isMenor) {
        corBg = 'bg-emerald-600 border-emerald-400 text-white ring-4 ring-emerald-500/30 scale-105';
      } else if (isMaior) {
        corBg = 'bg-rose-700 border-rose-500 text-white';
      } else {
        corBg = 'bg-amber-600 border-amber-400 text-white';
      }

      const html = `
        <div class="custom-pin flex flex-col items-center">
          <div class="px-2 py-1 rounded-lg border text-xs font-bold shadow-xl flex items-center gap-1 ${corBg}">
            ${isDestino ? '<span>🎯</span>' : isMenor ? '<span>★</span>' : ''}
            <span>R$ ${preco.toFixed(2)}</span>
          </div>
          <div class="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'fuel-marker',
        html: html,
        iconSize: [60, 30],
        iconAnchor: [30, 30],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([posto.lat, posto.lng], { icon: customIcon });

      marker.on('click', () => {
        if (onSelecionarPosto) {
          onSelecionarPosto(posto);
        }
      });

      const popupHtml = `
        <div class="p-2 min-w-[220px] font-sans text-slate-800">
          <div class="flex items-center justify-between gap-2 border-b pb-1.5 mb-2">
            <div>
              <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                ${posto.bandeira}
              </span>
              <h3 class="font-bold text-sm text-slate-900 mt-1 leading-tight">${posto.nome}</h3>
            </div>
            ${isMenor ? '<span class="text-xs font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Mais Barato!</span>' : ''}
          </div>

          <div class="text-[11px] text-slate-600 mb-2">
            <p>${posto.endereco} - ${posto.bairro}</p>
            <p class="font-semibold text-emerald-700 mt-0.5">${posto.distanciaKm ? `${posto.distanciaKm} km de você` : ''}</p>
          </div>

          <div class="grid grid-cols-2 gap-1.5 text-xs bg-slate-50 p-2 rounded-lg border mb-2.5">
            <div>
              <span class="text-[10px] text-slate-500 block">Gasolina Comum</span>
              <strong class="text-slate-900">R$ ${posto.precos.gasolina_comum?.toFixed(2) ?? '--'}</strong>
            </div>
            <div>
              <span class="text-[10px] text-slate-500 block">Etanol</span>
              <strong class="text-slate-900">R$ ${posto.precos.etanol?.toFixed(2) ?? '--'}</strong>
            </div>
          </div>

          <div class="flex gap-1.5 pt-1 border-t">
            <button 
              id="btn-tracar-rota-${posto.id}"
              class="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-2 rounded-md font-bold text-xs transition-colors flex items-center justify-center gap-1"
            >
              Traçar Rota no App
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-tracar-rota-${posto.id}`);
        if (btn && onSelecionarPosto) {
          btn.onclick = () => {
            onSelecionarPosto(posto);
            marker.closePopup();
          };
        }
      });

      layer.addLayer(marker);
    });
  }, [postos, combustivelSelecionado, postoDestino, onSelecionarPosto]);

  return (
    <div className="relative w-full h-full min-h-[450px]">
      <div ref={mapContainerRef} className="w-full h-full rounded-b-xl z-0" />
      {/* Legenda flutuante */}
      <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-2 rounded-lg text-xs text-white shadow-xl flex flex-col gap-1.5 pointer-events-none">
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
    </div>
  );
};
