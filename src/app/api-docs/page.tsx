'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Swagger UI를 동적으로 로드 (SSR 비활성화)
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Swagger UI를 로드하는 중...</div>
});

function ApiDocsPage() {
  const [spec, setSpec] = useState(null);
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // 환경 확인
    const isDev = process.env.NODE_ENV === 'development';
    setIsProduction(!isDev);

    if (!isDev) {
      return; // 프로덕션에서는 스펙을 로드하지 않음
    }

    // API 스펙 로드 (개발 환경에서만)
    async function loadSpec() {
      try {
        const spec = await fetch('/api-doc').then((res) => res.json());
        setSpec(spec);
      } catch (error) {
        console.error('Failed to load API spec:', error);
      }
    }
    loadSpec();
  }, []);

  // 프로덕션 환경에서는 접근 불가 메시지 표시
  if (isProduction) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            접근 불가
          </h1>
          <p className="text-gray-600 mb-4">
            API 문서는 개발 환경에서만 접근할 수 있습니다.
          </p>
          <p className="text-sm text-gray-500">
            보안을 위해 프로덕션 환경에서는 비활성화되었습니다.
          </p>
          <div className="mt-6">
            <a
              href="/"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              홈으로 돌아가기
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">API 문서 로드 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="swagger-wrapper">
      <SwaggerUI
        spec={spec}
        persistAuthorization={true}
        requestInterceptor={(req) => {
          // 쿠키를 자동으로 포함
          req.credentials = 'include';
          return req;
        }}
      />
    </div>
  );
}

export default ApiDocsPage;
