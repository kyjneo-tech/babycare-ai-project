import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BabyCare AI - 따뜻한 육아 동반자',
    short_name: 'BabyCare AI',
    description: 'AI 기반 맞춤형 육아 가이드 및 성장 기록',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',        // 세로 방향 고정
    background_color: '#FAFAFA',
    theme_color: '#f4a5a5',         // Primary color
    categories: ['health', 'lifestyle', 'parenting'], // 앱 카테고리
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',    // 적응형 아이콘
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
