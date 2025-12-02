# 보안 강화 가이드

이 문서는 BabyCare AI 애플리케이션에 적용된 보안 조치를 설명합니다.

## 📋 목차

1. [Rate Limiting (요청 속도 제한)](#rate-limiting)
2. [입력 검증 및 Validation](#입력-검증)
3. [중복 요청 방지](#중복-요청-방지)
4. [API 보안 미들웨어](#api-보안-미들웨어)
5. [인증 및 권한 관리](#인증-및-권한-관리)

---

## 🚦 Rate Limiting

악의적인 대량 요청을 방지하기 위해 다음과 같은 Rate Limit을 적용했습니다:

### 적용된 Rate Limit

| API 유형 | 제한 | 설명 |
|---------|-----|------|
| 로그인 시도 | 5회/분 | 무차별 대입 공격 방지 |
| AI 채팅 | 10회/분 | AI API 남용 방지 |
| 활동 기록 생성 | 30회/분 | 대량 입력 방지 |
| 노트/투두 생성 | 20회/분 | 스팸 방지 |
| 초대 코드 생성 | 5회/시간 | 초대 코드 스팸 방지 |
| 데이터 조회 | 120회/분 | 과도한 조회 방지 |
| 일반 API | 60회/분 | 기본 제한 |

### 구현 위치

- **정의**: `src/shared/lib/ratelimit.ts`
- **적용 예시**:
  - `src/features/activities/actions.ts` - 활동 기록 생성
  - `src/features/ai-chat/actions.ts` - AI 채팅
  - `src/app/api/notes/route.ts` - 노트 생성 (API)
  - `src/features/notes/actions.ts` - 노트 생성 (Server Action)
  - `src/app/api/families/invite/route.ts` - 초대 코드 생성

### 동작 방식

```typescript
// Rate limit 초과 시 응답 예시
{
  "success": false,
  "error": "너무 많은 활동 기록을 생성하고 있습니다. 잠시 후 다시 시도해주세요."
}
```

---

## ✅ 입력 검증

모든 사용자 입력에 대해 엄격한 검증을 수행합니다.

### 1. 활동 기록 검증

**위치**: `src/shared/types/schemas.ts`

#### 검증 항목

- **ID 길이**: 최대 100자
- **메모**: 최대 1000자
- **수유량**: 최대 500ml (비정상적으로 큰 값 차단)
- **수면 시간**: 최대 24시간 (86400초)
- **체온**: 30°C ~ 45°C (비정상 범위 차단)
- **시간 검증**:
  - 미래 날짜 차단
  - 종료 시간 > 시작 시간 검증

### 2. 노트 생성 검증

**위치**: `src/app/api/notes/route.ts`

- **제목**: 최대 200자
- **내용**: 최대 5000자
- **태그**: 최대 20개

### 3. XSS 방지

**위치**: `src/shared/middleware/security.ts`

- HTML 태그 제거
- JavaScript 코드 차단
- 이벤트 핸들러 제거

---

## 🔁 중복 요청 방지

같은 요청이 짧은 시간 내에 반복되는 것을 방지합니다.

### Idempotency Key 시스템

**위치**: `src/shared/lib/idempotency.ts`

### 동작 방식

1. 요청 데이터를 기반으로 고유 키 생성
2. Redis에 키 저장 (TTL: 1분)
3. 같은 키로 재요청 시 차단

### 적용 예시

```typescript
// 활동 기록 생성 시
const requestKey = generateRequestKey({
  babyId: input.babyId,
  type: input.type,
  startTime: input.startTime.toISOString(),
});

const isDuplicate = await checkDuplicateRequest(userId, requestKey, 60);
if (isDuplicate) {
  return { error: "동일한 활동이 이미 기록되었습니다." };
}
```

### 차단되는 케이스

- 같은 아기, 같은 활동 유형, 같은 시간에 1분 내 재등록

---

## 🛡️ API 보안 미들웨어

**위치**: `src/shared/middleware/security.ts`

### 제공 기능

1. **요청 크기 제한**: 기본 100KB
2. **Content-Type 검증**: JSON만 허용
3. **HTTP 메서드 검증**: 허용된 메서드만 사용 가능
4. **보안 헤더 자동 추가**:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Content-Security-Policy`

### 사용 방법

```typescript
export const POST = withSecurity(
  async (req: NextRequest) => {
    // API 로직
  },
  {
    maxSizeKB: 100,
    allowedMethods: ['POST'],
  }
);
```

---

## 🔐 인증 및 권한 관리

### NextAuth 기반 인증

- **세션 기반 인증** (쿠키 사용)
- **안전한 비밀번호 저장**: bcrypt 해싱

### 권한 레벨

| 권한 | 설명 | 가능한 작업 |
|-----|------|------------|
| owner | 소유자 | 모든 작업 + 가족 삭제 + 권한 변경 |
| admin | 관리자 | 구성원 관리 + 초대 코드 생성 |
| member | 일반 구성원 | 기록 작성/수정/삭제 |
| viewer | 조회자 | 조회만 가능 |

### 권한 체크 함수

**위치**: `src/features/families/utils/permissions.ts`

- `isOwner()`: 소유자 확인
- `isAdminOrOwner()`: 관리자 이상 확인
- `getMyPermission()`: 내 권한 조회

### 투두 리스트/노트 권한 검증

**위치**:
- `src/features/notes/actions.ts` - Server Actions
- `src/app/api/notes/[noteId]/route.ts` - API Routes

모든 노트 수정/삭제 요청 시:
1. 사용자가 해당 가족의 구성원인지 확인
2. 노트가 해당 가족의 아기에 속하는지 확인
3. 권한이 없으면 403 Forbidden 반환

```typescript
// 권한 검증 예시
const note = await prisma.note.findUnique({
  where: { id: noteId },
  include: {
    Baby: {
      include: {
        Family: {
          include: {
            FamilyMembers: {
              where: { userId: user.id }
            }
          }
        }
      }
    }
  }
});

if (note.Baby.Family.FamilyMembers.length === 0) {
  return { error: '권한이 없습니다.' };
}
```

---

## 🚨 주요 차단 시나리오

### 1. 대량 활동 기록 입력 시도

```
❌ 1분에 100개 입력 시도
✅ 30개까지만 허용 (Rate Limit)
✅ 중복 기록 차단 (Idempotency)
```

### 2. 비정상 데이터 입력

```
❌ 수유량 1000ml 입력
✅ 최대 500ml로 제한

❌ 체온 100도 입력
✅ 30~45도 범위로 제한

❌ 미래 날짜 입력
✅ 현재 시간 이전만 허용
```

### 3. 초대 코드 스팸

```
❌ 초대 코드 연속 생성
✅ 시간당 5회로 제한
✅ 고유 코드 생성 재시도 10회 제한
```

### 4. XSS 공격 시도

```
❌ <script>alert('XSS')</script> 입력
✅ 스크립트 태그 제거
✅ 이벤트 핸들러 제거
```

### 5. 다른 가족의 투두/노트 접근 시도

```
❌ 다른 가족의 노트 ID로 수정/삭제 요청
✅ 권한 검증으로 차단 (403 Forbidden)
✅ "이 노트를 수정할 권한이 없습니다" 에러 반환
```

### 6. 노트 대량 생성

```
❌ 1분에 50개 노트 생성 시도
✅ 20개까지만 허용 (Rate Limit)
✅ "너무 많은 노트를 생성하고 있습니다" 에러 반환
```

---

## 📊 모니터링

### 로그 기록

**위치**: `src/shared/lib/logger.ts`

- Rate limit 초과 로그
- 중복 요청 시도 로그
- 보안 위협 감지 로그

### 로그 예시

```typescript
logger.warn('활동 기록 생성 rate limit 초과', { userId });
logger.warn('중복 활동 기록 생성 시도', { userId, requestKey });
```

---

## 🔧 환경 변수 설정

보안 기능 활성화를 위해 다음 환경 변수가 필요합니다:

```env
# Redis (Rate Limiting & Idempotency)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# NextAuth
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

---

## ⚠️ 주의사항

1. **Redis 필수**: Rate Limiting과 중복 방지 기능은 Redis가 없으면 비활성화됩니다.
2. **환경 변수 관리**: `.env` 파일은 절대 Git에 커밋하지 마세요.
3. **프로덕션 설정**: 프로덕션 환경에서는 더 엄격한 Rate Limit 적용을 권장합니다.

---

## 📝 추가 보안 권장사항

### 향후 개선 가능 항목

1. **HTTPS 강제**: 프로덕션에서 HTTPS만 허용
2. **CORS 설정**: 허용된 도메인만 API 접근 가능
3. **IP 기반 차단**: 악의적 IP 자동 차단
4. **2FA 인증**: 중요 작업 시 2단계 인증
5. **감사 로그**: 모든 중요 작업 기록

---

## 📞 보안 이슈 제보

보안 취약점을 발견하신 경우 이슈 트래커에 비공개로 제보해주세요.

---

**마지막 업데이트**: 2025-11-25
