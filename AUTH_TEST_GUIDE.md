# 인증 보안 테스트 가이드

## 🧪 수동 테스트 방법

### 준비 사항
1. 개발 서버 실행: `npm run dev`
2. 브라우저 시크릿 모드 열기 (세션 없는 상태)

---

## 테스트 케이스

### ✅ Test 1: 메인 대시보드 직접 접근
**URL**: `http://localhost:3000/dashboard`

**예상 결과**:
- 로그인 페이지로 리다이렉트
- URL: `http://localhost:3000/login?callbackUrl=/dashboard`

**확인 사항**:
- [ ] 로그인 페이지가 표시됨
- [ ] URL에 callbackUrl 파라미터가 있음

---

### ✅ Test 2: 가족 관리 페이지 직접 접근
**URL**: `http://localhost:3000/dashboard/family`

**예상 결과**:
- 로그인 페이지로 리다이렉트
- URL: `http://localhost:3000/login?callbackUrl=/dashboard/family`

**확인 사항**:
- [ ] 로그인 페이지가 표시됨
- [ ] URL에 callbackUrl=/dashboard/family가 있음

---

### ✅ Test 3: 설정 페이지 직접 접근
**URL**: `http://localhost:3000/dashboard/settings`

**예상 결과**:
- 로그인 페이지로 리다이렉트
- URL: `http://localhost:3000/login?callbackUrl=/dashboard/settings`

**확인 사항**:
- [ ] 로그인 페이지가 표시됨
- [ ] URL에 callbackUrl=/dashboard/settings가 있음

---

### ✅ Test 4: 아기 추가 페이지 직접 접근
**URL**: `http://localhost:3000/dashboard/add-baby`

**예상 결과**:
- 로그인 페이지로 리다이렉트
- URL: `http://localhost:3000/login?callbackUrl=/dashboard/add-baby`

**확인 사항**:
- [ ] 로그인 페이지가 표시됨
- [ ] URL에 callbackUrl=/dashboard/add-baby가 있음

---

### ✅ Test 5: 아기 상세 페이지 직접 접근 (특정 탭)
**URL**: `http://localhost:3000/dashboard/babies/some-baby-id?tab=analytics`

**예상 결과**:
- 로그인 페이지로 리다이렉트
- URL: `http://localhost:3000/login?callbackUrl=/dashboard/babies/some-baby-id?tab=analytics`

**확인 사항**:
- [ ] 로그인 페이지가 표시됨
- [ ] URL에 callbackUrl에 탭 정보가 포함됨

---

### ✅ Test 6: 게스트 모드 접근
**URL**: `http://localhost:3000/dashboard/babies/guest-baby-id`

**예상 결과**:
- 게스트 모드 페이지가 표시됨
- 로그인 없이 접근 가능

**확인 사항**:
- [ ] 페이지가 정상적으로 표시됨
- [ ] 로그인 페이지로 리다이렉트되지 않음
- [ ] 샘플 데이터가 표시됨

---

### ✅ Test 7: 게스트 모드 Analytics 접근
**URL**: `http://localhost:3000/dashboard/analytics/guest-baby-id`

**예상 결과**:
- `/dashboard/babies/guest-baby-id?tab=analytics`로 리다이렉트
- 게스트 모드 Analytics 페이지가 표시됨

**확인 사항**:
- [ ] Analytics 탭이 표시됨
- [ ] 로그인 없이 접근 가능

---

### ✅ Test 8: 로그인 후 원래 페이지로 복귀

**단계**:
1. 시크릿 모드에서 `http://localhost:3000/dashboard/family` 접근
2. 로그인 페이지로 리다이렉트됨 확인
3. 유효한 계정으로 로그인
4. 로그인 성공 후 자동으로 `/dashboard/family`로 이동하는지 확인

**예상 결과**:
- 로그인 성공 후 `/dashboard/family` 페이지가 표시됨

**확인 사항**:
- [ ] 로그인 성공
- [ ] `/dashboard/family` 페이지로 자동 이동
- [ ] 페이지가 정상적으로 표시됨

---

### ✅ Test 9: 로그인 후 탭 정보 유지

**단계**:
1. 시크릿 모드에서 `http://localhost:3000/dashboard/babies/[실제-baby-id]?tab=analytics` 접근
2. 로그인 페이지로 리다이렉트됨 확인
3. 유효한 계정으로 로그인
4. 로그인 성공 후 자동으로 원래 페이지의 analytics 탭으로 이동하는지 확인

**예상 결과**:
- 로그인 성공 후 `/dashboard/babies/[baby-id]?tab=analytics` 페이지가 표시됨
- Analytics 탭이 활성화되어 있음

**확인 사항**:
- [ ] 로그인 성공
- [ ] 원래 페이지로 자동 이동
- [ ] Analytics 탭이 활성화됨

---

### ✅ Test 10: 인증된 상태에서 보호된 페이지 접근

**단계**:
1. 정상적으로 로그인
2. `/dashboard/family` 접근
3. `/dashboard/settings` 접근
4. `/dashboard/add-baby` 접근

**예상 결과**:
- 모든 페이지가 정상적으로 표시됨
- 로그인 페이지로 리다이렉트되지 않음

**확인 사항**:
- [ ] 모든 페이지 정상 접근
- [ ] 리다이렉트 없음

---

## 🔍 브라우저 콘솔 로그 확인

### Middleware 로그
```
✅ Guest mode path detected: /dashboard/analytics/guest-baby-id
🚫 Protected path without authentication: /dashboard/family
   Redirecting to login...
✅ Authenticated access to: /dashboard/family
```

### 로그인 페이지 로그
```
[login page] signIn result: { ok: true, ... }
[login page] Redirecting to: /dashboard/family
```

---

## 📊 테스트 결과 기록

| 테스트 케이스 | 상태 | 비고 |
|------------|------|------|
| Test 1: 메인 대시보드 | ⬜ | |
| Test 2: 가족 관리 | ⬜ | |
| Test 3: 설정 | ⬜ | |
| Test 4: 아기 추가 | ⬜ | |
| Test 5: 아기 상세 (탭) | ⬜ | |
| Test 6: 게스트 모드 | ⬜ | |
| Test 7: 게스트 Analytics | ⬜ | |
| Test 8: 로그인 후 복귀 | ⬜ | |
| Test 9: 탭 정보 유지 | ⬜ | |
| Test 10: 인증 상태 접근 | ⬜ | |

---

## 🐛 문제 발견 시

### 체크 사항
1. **개발 서버가 재시작되었는지 확인**
2. **브라우저 캐시 삭제**
3. **시크릿 모드 사용**
4. **.env 파일에 NEXTAUTH_SECRET이 설정되어 있는지 확인**

### 디버깅 팁
- 브라우저 개발자 도구 → Network 탭에서 리다이렉트 확인
- 브라우저 개발자 도구 → Console 탭에서 로그 확인
- 서버 터미널에서 middleware 로그 확인

---

**테스트 일시**: _____________  
**테스트 담당자**: _____________  
**결과**: ⬜ 통과 / ⬜ 실패
