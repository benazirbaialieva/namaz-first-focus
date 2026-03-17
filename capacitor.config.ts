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
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#F5F3EF',
      androidSplashResourceName: 'splash',
      iosSpinnerStyle: 'small',
      spinnerColor: '#0F4F5C',
    },
  },
};

export default config;
