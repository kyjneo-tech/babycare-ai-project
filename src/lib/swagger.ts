
import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api', // The folder where your API routes are located
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'AI-MOM API',
        version: '1.0',
        description: `
# AI-MOM API 문서

## 인증 방법

이 API는 **NextAuth 세션 쿠키** 기반 인증을 사용합니다.

### Swagger에서 API 테스트하는 방법:

1. **브라우저에서 먼저 로그인하세요:**
   - [로그인 페이지](/login)에서 로그인

2. **로그인 후 이 페이지에서 바로 테스트:**
   - "Authorize" 버튼을 누를 필요 없이 바로 "Try it out" 사용
   - 세션 쿠키가 자동으로 포함됩니다

3. **인증이 필요 없는 API:**
   - \`POST /api/auth/signup\` - 회원가입
   - \`POST /api/auth/login\` - 로그인
   - \`GET /api/families/invite?code=...\` - 초대 코드 조회

---
        `,
      },
      components: {
        securitySchemes: {
          SessionCookie: {
            type: 'apiKey',
            in: 'cookie',
            name: 'next-auth.session-token',
            description: 'NextAuth 세션 쿠키 (브라우저에서 로그인하면 자동으로 설정됩니다)',
          },
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: '(선택) JWT 토큰을 사용하는 경우',
          },
        },
      },
      security: [
        {
          SessionCookie: [],
        },
      ],
    },
  });
  return spec;
};
