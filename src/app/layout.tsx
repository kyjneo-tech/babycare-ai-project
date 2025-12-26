import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "BebeKnock (베베노크) - 사랑의 노크, 아이와의 첫 번째 대화",
  description: "아이의 신호를 읽다, 육아를 기록하다. AI 기반 맞춤형 육아 가이드 서비스",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  other: {
    'privacy-policy': 'https://babycare-ai.vercel.app/privacy-policy',
    'terms-of-service': 'https://babycare-ai.vercel.app/terms-of-service',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#C084FC", // Moonlight Lavender primary color
};

import Providers from './providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${nunito.variable} antialiased font-sans bg-background min-h-screen relative`}
      >
        {/* Full-app Dark Aurora Background */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-900/20 blur-[120px] animate-blob" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-purple-900/10 blur-[120px] animate-blob animation-delay-2000" />
          <div className="absolute top-[30%] right-[20%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] animate-blob animation-delay-4000" />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
        
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
