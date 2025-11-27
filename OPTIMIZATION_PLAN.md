# 🚀 BabyCare AI - Vercel 배포 성능 최적화 실행 계획서

**작성일**: 2025-11-27
**목표**: Vercel 배포 환경에서 쌩쌩하게 돌아가는 애플리케이션 만들기

---

## 📊 현재 상태 진단

### 측정 지표
- **빌드 폴더 크기**: 623MB (.next)
- **프로덕션 빌드**: 3.6MB (static)
- **최대 JS 번들**: 636KB × 2개
- **이미지 크기**: 584KB (아이콘 2개)
- **폰트**: 4개 (Geist Sans, Geist Mono, Nunito, Jua)
- **미사용 파일**: entities/, shared/components/, BabyDetailTabs.tsx

### 잘하고 있는 부분 ✅
- DDD 패턴 기반 구조 (features 도메인 분리)
- shadcn UI 중복 없이 구조화
- Design System 중앙화
- 합리적인 프로덕션 빌드 크기

### 개선이 필요한 부분 ⚠️
- 무거운 JS 번들 (recharts, Google AI)
- 최적화되지 않은 이미지
- 불필요한 폰트 로딩
- 미사용 코드 및 의존성

---

## 🎯 최적화 목표

| 지표 | 현재 | 목표 | 개선율 |
|------|------|------|--------|
| 초기 JS 번들 | ~1.2MB | ~600KB | 50%↓ |
| 초기 로딩 시간 | ~3-4초 | ~1-2초 | 50%↓ |
| 이미지 크기 | 584KB | ~70KB | 88%↓ |
| 빌드 시간 | ~3.5초 | ~2.5초 | 30%↓ |
| Lighthouse 점수 | 70-80점 | 90-95점 | 20%↑ |

---

## 📋 실행 계획 (Phase별)

### 🔴 Phase 1: 즉시 실행 항목 (High Impact, Low Effort)

#### ✅ 1.1 미사용 파일 삭제
- [ ] `src/entities/` 폴더 삭제
- [ ] `src/shared/components/` 폴더 삭제
- [ ] `src/features/babies/components/BabyDetailTabs.tsx` 삭제
- [ ] import 경로 확인 및 정리

**예상 효과**: 코드베이스 ~200줄 감소, 빌드 시간 5-10% 단축

---

#### ✅ 1.2 이미지 최적화
- [ ] `public/icons/icon-192x192.png` 최적화 (292KB → ~20KB)
- [ ] `public/icons/icon-512x512.png` 최적화 (292KB → ~50KB)
- [ ] WebP 포맷 변환 또는 압축

**예상 효과**: 초기 로딩 0.5-1초 단축, 500KB 절감

---

#### ✅ 1.3 Next.js 설정 최적화
- [ ] `next.config.ts`에 최적화 옵션 추가
  - swcMinify: true
  - optimizePackageImports
  - 이미지 최적화 설정
  - 캐시 헤더 설정

**예상 효과**: 초기 로딩 20-30% 개선, 번들 크기 10-15% 감소

---

#### ✅ 1.4 미사용 devDependencies 제거
- [ ] 16개 미사용 패키지 제거
  - @tailwindcss/postcss
  - @testing-library/jest-dom
  - @types/jest
  - @types/supertest
  - cross-env
  - dotenv
  - jest-environment-jsdom
  - next-test-api-route-handler
  - playwright-core
  - shadcn
  - supertest
  - ts-jest
  - tw-animate-css
  - undici

**예상 효과**: node_modules 크기 감소, 빌드 시간 단축

---

### 🟡 Phase 2: 단기 개선 (Medium Impact, Medium Effort)

#### ✅ 2.1 동적 Import 적용
- [ ] AIChatView 동적 로딩
- [ ] BabyAnalyticsView 동적 로딩
- [ ] GrowthChart 동적 로딩
- [ ] InteractiveScheduleTimeline 동적 로딩
- [ ] Timeline 컴포넌트들 동적 로딩

**예상 효과**: 초기 JS 번들 ~300-400KB 절감

---

#### ✅ 2.2 폰트 최적화
- [ ] Geist Sans 제거
- [ ] Geist Mono 제거
- [ ] Nunito, Jua만 유지
- [ ] fallback 폰트 설정

**예상 효과**: ~100-150KB 절감, 렌더링 차단 시간 감소

---

#### ✅ 2.3 Timeline 컴포넌트 통합
- [ ] 6개 Timeline 컴포넌트 분석
  - DailyTimeline
  - WeeklyTimeline
  - ActivityTimeline
  - VerticalTimeline
  - UnifiedTimeline
  - MobileOptimizedTimeline
- [ ] 사용되는 컴포넌트만 유지
- [ ] 미사용 컴포넌트 삭제

**예상 효과**: 코드 중복 제거, 유지보수성 향상

---

### 🟢 Phase 3: 장기 개선 (High Impact, High Effort)

#### ✅ 3.1 Prisma select 최적화
- [ ] `src/app/page.tsx`의 Prisma 쿼리 최적화
- [ ] `src/app/babies/[id]/page.tsx`의 Prisma 쿼리 최적화
- [ ] 필요한 필드만 select

**예상 효과**: API 응답 크기 30-50% 감소, TTFB 개선

---

#### ✅ 3.2 빌드 및 검증
- [ ] 최적화 후 프로덕션 빌드
- [ ] 번들 크기 확인
- [ ] Lighthouse 점수 측정
- [ ] 성능 지표 비교

---

## 📈 진행 상황

### ✅ Phase 1: 즉시 실행 항목 (완료)
- [x] 최적화 계획서 문서 작성
- [x] 미사용 파일 삭제 (entities/, shared/components/, BabyDetailTabs.tsx)
- [x] 이미지 최적화 분석 및 권장 사항 제시
- [x] Next.js 설정 최적화 (next.config.ts)
- [x] 폰트 최적화 (4개 → 2개)
- [x] devDependencies 제거 (14개 패키지, 289개 의존성)

### ✅ Phase 2: 단기 개선 (완료)
- [x] 동적 Import 적용 (AIChatView, BabyAnalyticsView, GrowthChart, InteractiveScheduleTimeline)
- [x] Timeline 컴포넌트 분석 및 정리
- [x] 미사용 Timeline 컴포넌트 삭제 (757줄)

### ✅ Phase 3: 장기 개선 (완료)
- [x] Prisma select 최적화 (8개 파일)
- [x] TypeScript 타입 에러 수정 (API routes)
- [x] 최종 빌드 및 검증

## 🎉 최종 결과

### 빌드 성공 ✅
```
✓ Compiled successfully in 3.4s
✓ TypeScript 검증 완료
✓ 정적 페이지 생성 완료 (20개)
```

### 삭제된 코드
- **미사용 파일**: 757줄 + entities 폴더 전체
- **devDependencies**: 14개 패키지 (289개 의존성)
- **폰트**: 2개 제거 (Geist Sans, Geist Mono)

---

## 🔧 기술 스택

- **Framework**: Next.js 16.0.3 (App Router)
- **UI**: shadcn/ui + Tailwind CSS 4
- **Database**: Prisma + PostgreSQL
- **AI**: Google Gemini AI
- **Charts**: Recharts
- **Deployment**: Vercel

---

## 📝 참고 사항

- 모든 변경사항은 git commit으로 관리
- Phase별로 테스트 후 다음 단계 진행
- Vercel 배포 후 실제 성능 측정
- 롤백 가능하도록 브랜치 관리

---

**마지막 업데이트**: 2025-11-27
