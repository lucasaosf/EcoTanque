// Serviço de Roteamento, Cálculo de Distância Viária e Tempo Estimado (ETA)
export interface RotaDetalhada {
  distanciaKm: number;
  duracaoMinutos: number;
  horaEstimadaChegada: string;
  coordenadasGeoJSON: [number, number][]; // [lat, lng] para o Leaflet
  instrucoes?: string[];
}

// Calcula rota veicular real por ruas/avenidas via OSRM (Open Source Routing Machine)
export async function calcularRotaVeicular(
  origemLat: number,
  origemLng: number,
  destinoLat: number,
  destinoLng: number
): Promise<RotaDetalhada> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origemLng},${origemLat};${destinoLng},${destinoLat}?overview=full&geometries=geojson`;
    
    // Timeout de 4 segundos com AbortController para não travar em conexões lentas
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const rota = data.routes[0];
        const distanciaMetros = rota.distance;
        const duracaoSegundos = rota.duration;

        // OSRM retorna GeoJSON [lng, lat], convertemos para Leaflet [lat, lng]
        const coordenadasLeaflet: [number, number][] = rota.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        );

        const agora = new Date();
        const minutosAdicionais = Math.ceil(duracaoSegundos / 60);
        const dataChegada = new Date(agora.getTime() + minutosAdicionais * 60000);
        const horaChegadaStr = dataChegada.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        return {
          distanciaKm: Number((distanciaMetros / 1000).toFixed(1)),
          duracaoMinutos: minutosAdicionais,
          horaEstimadaChegada: horaChegadaStr,
          coordenadasGeoJSON: coordenadasLeaflet,
        };
      }
    }
  } catch (error) {
    console.warn('Serviço de malha viária indisponível, usando estimativa matemática de tráfego', error);
  }

  // Fallback Inteligente baseado em Haversine + Fator de Tortuosidade Urbana (1.3x) e Tráfego Médio (30 km/h)
  const R = 6371;
  const dLat = ((destinoLat - origemLat) * Math.PI) / 180;
  const dLon = ((destinoLng - origemLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((origemLat * Math.PI) / 180) *
      Math.cos((destinoLat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanciaLinhaReta = R * c;

  // Em cidades brasileiras, a distância real por ruas é em média 28% a 35% maior que a linha reta
  const distanciaEstimadaKm = Number((distanciaLinhaReta * 1.3).toFixed(1));
  // Velocidade média urbana em horário regular: ~28 km/h
  const duracaoMinutos = Math.max(2, Math.round((distanciaEstimadaKm / 28) * 60));

  const agora = new Date();
  const dataChegada = new Date(agora.getTime() + duracaoMinutos * 60000);
  const horaChegadaStr = dataChegada.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    distanciaKm: distanciaEstimadaKm,
    duracaoMinutos: duracaoMinutos,
    horaEstimadaChegada: horaChegadaStr,
    coordenadasGeoJSON: [
      [origemLat, origemLng],
      [destinoLat, destinoLng],
    ],
  };
}
