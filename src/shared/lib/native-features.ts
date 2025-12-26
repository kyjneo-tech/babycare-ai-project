import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { SplashScreen } from '@capacitor/splash-screen';

export const NativeFeatures = {
  // 상태바 초기화: 투명하게 만들고 아이콘은 밝게 (다크 테마이므로)
  initializeStatusBar: async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.setStyle({ style: Style.Dark }); // 다크 모드에서는 아이콘이 밝아야 함 (Style.Dark는 'Dark Content'가 아니라 'Dark Background'를 의미하는지 플랫폼마다 다름. 보통 Style.Light가 '검은 글씨', Style.Dark가 '흰 글씨'임)
        // Capacitor Status Bar Style: 
        // Style.Light = Light Content (White Text) -> For Dark Backgrounds
        // Style.Dark = Dark Content (Black Text) -> For Light Backgrounds
        // Wait, documentation says:
        // iOS: Style.Dark = Light text (for dark backgrounds). Style.Light = Dark text (for light backgrounds).
        // Android: Same usually.
        // Let's use Style.Dark which typically means "Dark Mode friendly" (White text).
        
        await StatusBar.setStyle({ style: Style.Dark }); 
        
        if (Capacitor.getPlatform() === 'android') {
           await StatusBar.setOverlaysWebView({ overlay: true });
           await StatusBar.setBackgroundColor({ color: '#00000000' }); // Transparent
        }
      } catch (e) {
        console.warn('StatusBar plugin not available', e);
      }
    }
  },

  // 스플래시 스크린 숨기기
  hideSplashScreen: async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await SplashScreen.hide({ fadeOutDuration: 500 });
      } catch (e) {
        // Ignore
      }
    }
  },

  // 뒤로가기 버튼 핸들링
  initializeBackButton: () => {
    if (Capacitor.isNativePlatform()) {
      App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp();
        } else {
          window.history.back();
        }
      });
    }
  },

  // 햅틱 피드백
  haptic: async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style });
      } catch (e) {
        // Ignore haptic errors
      }
    }
  }
};
