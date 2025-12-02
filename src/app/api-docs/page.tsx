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

  useEffect(() => {
    // API 스펙 로드
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
