import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.codewise.namazfirst',
  appName: 'Salah Guard',
  webDir: 'dist',
  server: {
    url: 'https://981b6eae-0a1c-4584-9968-9cd367ab8212.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;
