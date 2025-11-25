// src/shared/middleware/security.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * XSS 방지를 위한 입력 sanitization
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // 기본적인 XSS 방지: HTML 태그 제거
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, ''); // onclick, onerror 등
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }

  return input;
}

/**
 * SQL Injection 방지를 위한 검증 (Prisma 사용 시 자동 방어되지만 추가 검증)
 */
export function validateSqlInput(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|\||;|\/\*|\*\/)/g,
    /(\bUNION\b.*\bSELECT\b)/gi,
  ];

  return !sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * 요청 크기 제한 검증
 */
export function validateRequestSize(
  request: NextRequest,
  maxSizeKB: number = 100
): boolean {
  const contentLength = request.headers.get('content-length');
  if (!contentLength) return true;

  const sizeKB = parseInt(contentLength) / 1024;
  return sizeKB <= maxSizeKB;
}

/**
 * Content-Type 검증
 */
export function validateContentType(
  request: NextRequest,
  allowedTypes: string[] = ['application/json']
): boolean {
  const contentType = request.headers.get('content-type');
  if (!contentType) return false;

  return allowedTypes.some(type => contentType.includes(type));
}

/**
 * 보안 헤더 추가
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );

  return response;
}

/**
 * API 보안 미들웨어 래퍼
 */
export function withSecurity(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    maxSizeKB?: number;
    allowedMethods?: string[];
    requireAuth?: boolean;
  } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // 1. HTTP 메서드 검증
    if (options.allowedMethods && !options.allowedMethods.includes(req.method)) {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // 2. 요청 크기 검증
    if (options.maxSizeKB && !validateRequestSize(req, options.maxSizeKB)) {
      return NextResponse.json(
        { error: 'Request size too large' },
        { status: 413 }
      );
    }

    // 3. Content-Type 검증 (POST, PUT, PATCH만)
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (!validateContentType(req)) {
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 415 }
        );
      }
    }

    // 4. 핸들러 실행
    try {
      const response = await handler(req);

      // 5. 보안 헤더 추가
      return addSecurityHeaders(response);
    } catch (error) {
      console.error('Security middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
