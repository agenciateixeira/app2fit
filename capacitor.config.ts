import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.app2fit.app',
  appName: 'App2Fit',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;