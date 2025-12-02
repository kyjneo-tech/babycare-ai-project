import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // 실험적 패키지 최적화 (특정 라이브러리의 번들 크기 감소)
  // Next.js 16+에서 Turbopack이 자동으로 최적화를 수행함
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "@radix-ui/*"],
  },

  // 이미지 최적화 설정
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1년
  },

  // 정적 에셋 캐싱을 위한 헤더 설정
  async headers() {
    return [
      {
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  transpilePackages: ['swagger-ui-react'],
};

export default nextConfig;
