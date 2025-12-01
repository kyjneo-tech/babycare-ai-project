import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.babycare.ai',
  appName: 'babycareai',
  webDir: 'public', 
  server: {
    url: 'https://babycare-ai.vercel.app',
    androidScheme: 'https',
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      clientId: '209032626720-j87f2vslqqpjur1na8ml85r63hdhrf7e.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
