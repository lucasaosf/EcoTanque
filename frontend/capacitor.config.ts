import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lucasaosf.ecotanque',
  appName: 'EcoTanque - Combustível Ao Vivo',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false, // Blindagem: proíbe tráfego HTTP sem TLS/SSL
  },
  plugins: {
    Geolocation: {
      // Configurações de precisão de GPS no Android
    },
  },
};

export default config;
