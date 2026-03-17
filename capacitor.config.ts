import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.codewise.namazfirst',
  appName: 'Salah Guard',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#F5F3EF',
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#F5F3EF',
    },
  },
};

export default config;
