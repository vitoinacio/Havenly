import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.havenly.app',
  appName: 'Havenly',
  webDir: 'www',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '526082973455-81f5gglnbnf6ted90d1o5vft3icvaf1d.apps.googleusercontent.com.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
