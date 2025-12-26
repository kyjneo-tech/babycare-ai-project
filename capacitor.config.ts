import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.babycare.ai',
  appName: 'BebeKnock',
  webDir: 'public', 
  server: {
    url: 'https://babycare-ai.vercel.app',
    androidScheme: 'https',
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      clientId: process.env.GOOGLE_CLIENT_ID || '209032626720-j87f2vslqqpjur1na8ml85r63hdhrf7e.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    SplashScreen: {
      launchShowDuration: 0, // 수동으로 제어하기 위해 0으로 설정
      backgroundColor: '#0f172a', // 다크 네이비 배경색
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
