import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Nunito, Jua } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const jua = Jua({
  weight: "400",
  variable: "--font-jua",
  subsets: ["latin"], // Jua in Google Fonts might strictly be Latin subset in next/font? usually it supports Korean but next/font might need 'latin' specified or just work. Jua is a Korean font.
  display: "swap",
});



export const metadata: Metadata = {
  title: "BabyCare AI - 따뜻한 육아 동반자",
  description: "AI 기반 맞춤형 육아 가이드",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BabyCare AI",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF8BA7", // Primary color
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
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} ${jua.variable} antialiased font-sans`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
