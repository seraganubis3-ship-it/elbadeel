import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'eg.com.albadel.twa',
  appName: 'البديل',
  webDir: 'public',
  server: {
    url: 'https://albadel.com.eg',
    cleartext: true
  }
};

export default config;
