import { getApiDocs } from '@/lib/swagger';
import { NextResponse } from 'next/server';

export async function GET() {
  // 프로덕션 환경에서는 API 문서 스펙을 노출하지 않음
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      {
        error: 'API 문서는 개발 환경에서만 접근할 수 있습니다.',
        message: 'API documentation is only available in development mode.'
      },
      { status: 403 }
    );
  }

  const spec = await getApiDocs();
  return NextResponse.json(spec);
}
