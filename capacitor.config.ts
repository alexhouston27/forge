import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.forge.app',
  appName: 'FORGE',
  webDir: 'out',
  server: {
    // Load the live Vercel deployment inside the native shell.
    // This means the app always has the latest web version without rebuilding.
    url: 'https://forgeapp-chi.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true,
  },
};

export default config;
