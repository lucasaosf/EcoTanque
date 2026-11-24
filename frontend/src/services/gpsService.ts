import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface CoordenadaGPS {
  lat: number;
  lng: number;
  precisao?: number;
}

/**
 * Solicita ativamente a permissão nativa de GPS no Android/iOS
 * Exibe a caixa de diálogo nativa do sistema operacional
 */
export async function solicitarPermissaoGPS(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const statusAtual = await Geolocation.checkPermissions();
      if (statusAtual.location === 'granted') {
        return true;
      }
      const solicitacao = await Geolocation.requestPermissions({
        permissions: ['location', 'coarseLocation'],
      });
      return solicitacao.location === 'granted';
    } else if (navigator.geolocation) {
      return true;
    }
  } catch (error) {
    console.warn('Erro ao solicitar permissão de GPS nativa:', error);
  }
  return false;
}

/**
 * Obtém a coordenada de alta precisão do dispositivo
 * Dispara o pop-up de permissão se ainda não foi concedida
 */
export async function obterPosicaoAtualDispositivo(): Promise<CoordenadaGPS | null> {
  // 1. No aplicativo Android nativo (Capacitor)
  if (Capacitor.isNativePlatform()) {
    try {
      await solicitarPermissaoGPS();
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 4000,
      });

      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        precisao: pos.coords.accuracy,
      };
    } catch (err) {
      console.warn('Erro no Geolocation nativo do Capacitor:', err);
    }
  }

  // 2. Fallback para navegador web ou se o nativo falhar
  if (navigator.geolocation) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            precisao: pos.coords.accuracy,
          });
        },
        (err) => {
          console.warn('Erro no navigator.geolocation:', err);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 4000 }
      );
    });
  }

  return null;
}

/**
 * Busca o nome da cidade/bairro a partir das coordenadas via Geocoding reverso
 */
export async function obterNomeLocalidade(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'EcoTanque/1.0 (GPS Resolver)' },
      }
    );
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      const cidade = data.address?.city || data.address?.town || data.address?.municipality || data.address?.village;
      const estado = data.address?.state_code || data.address?.state;
      const bairro = data.address?.suburb || data.address?.neighbourhood;

      if (cidade && estado) {
        return `${cidade} (${estado})`;
      }
      if (bairro && cidade) {
        return `${bairro}, ${cidade}`;
      }
      if (cidade) {
        return cidade;
      }
    }
  } catch (e) {
    console.warn('Não foi possível obter nome da cidade via reverse geocode', e);
  }
  return 'Sua Localização GPS';
}

/**
 * Inicia monitoramento contínuo em tempo real da posição do celular
 */
export async function iniciarWatcherGPS(
  onPosicao: (coords: CoordenadaGPS) => void
): Promise<string | number | null> {
  if (Capacitor.isNativePlatform()) {
    try {
      const watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 4000 },
        (position, err) => {
          if (position && !err) {
            onPosicao({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              precisao: position.coords.accuracy,
            });
          }
        }
      );
      return watchId;
    } catch (e) {
      console.warn('Erro ao registrar watchPosition nativo:', e);
    }
  }

  if (navigator.geolocation) {
    return navigator.geolocation.watchPosition(
      (pos) => {
        onPosicao({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          precisao: pos.coords.accuracy,
        });
      },
      (err) => console.warn('Erro watchPosition web:', err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 4000 }
    );
  }

  return null;
}

/**
 * Encerra o monitoramento de GPS
 */
export async function pararWatcherGPS(watchId: string | number | null): Promise<void> {
  if (!watchId) return;

  if (typeof watchId === 'string') {
    try {
      await Geolocation.clearWatch({ id: watchId });
    } catch (e) {
      console.warn('Erro ao limpar watch nativo', e);
    }
  } else if (typeof watchId === 'number') {
    navigator.geolocation.clearWatch(watchId);
  }
}
