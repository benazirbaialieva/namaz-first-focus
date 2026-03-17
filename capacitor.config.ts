import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.codewise.namazfirst',
  appName: 'Salah Guard',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#F5F3EF',
  },
  android: {
    backgroundColor: '#F5F3EF',
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#F5F3EF',
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: false,
      backgroundColor: '#F5F3EF',
      androidSplashResourceName: 'splash',
      iosSpinnerStyle: 'small',
      spinnerColor: '#0F4F5C',
    },
  },
};

export default config;
