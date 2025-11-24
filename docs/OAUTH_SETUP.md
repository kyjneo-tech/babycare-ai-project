# OAuth 소셜 로그인 설정 가이드

이 가이드는 Babycare AI 프로젝트에 Google과 Kakao 소셜 로그인을 설정하는 방법을 안내합니다.

---

## 1. Google OAuth 설정

### 1.1 Google Cloud Console 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속합니다.
2. 상단의 프로젝트 선택 드롭다운을 클릭하고 **"새 프로젝트"**를 선택합니다.
3. 프로젝트 이름을 입력하고 (예: `babycare-ai`) **"만들기"**를 클릭합니다.

### 1.2 OAuth 동의 화면 구성

1. 좌측 메뉴에서 **"API 및 서비스" > "OAuth 동의 화면"**을 선택합니다.
2. **User Type**에서 **"외부"**를 선택하고 **"만들기"**를 클릭합니다.
3. 앱 정보를 입력합니다:
   - **앱 이름**: `Babycare AI`
   - **사용자 지원 이메일**: 본인의 이메일
   - **앱 도메인** (선택사항):
     - 홈페이지: `http://localhost:3000` (개발 환경)
     - 개인정보처리방침: (선택사항)
     - 서비스 약관: (선택사항)
   - **승인된 도메인**: (배포 후 추가)
   - **개발자 연락처 정보**: 본인의 이메일
4. **"저장 후 계속"**을 클릭합니다.

### 1.3 범위(Scopes) 설정

1. **"범위 추가 또는 삭제"**를 클릭합니다.
2. 다음 범위를 선택합니다:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
3. **"업데이트"**를 클릭하고 **"저장 후 계속"**을 클릭합니다.

### 1.4 OAuth 2.0 클라이언트 ID 생성

1. 좌측 메뉴에서 **"사용자 인증 정보"**를 선택합니다.
2. 상단의 **"+ 사용자 인증 정보 만들기"**를 클릭하고 **"OAuth 클라이언트 ID"**를 선택합니다.
3. 애플리케이션 유형에서 **"웹 애플리케이션"**을 선택합니다.
4. 이름을 입력합니다 (예: `Babycare AI Web Client`).
5. **승인된 자바스크립트 원본**에 다음을 추가합니다:
   ```
   http://localhost:3000
   ```
6. **승인된 리디렉션 URI**에 다음을 추가합니다:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. **"만들기"**를 클릭합니다.

### 1.5 환경 변수 설정

생성된 **클라이언트 ID**와 **클라이언트 보안 비밀**을 복사하여 `.env` 파일에 추가합니다:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

> **중요**: `.env` 파일은 절대 Git에 커밋하지 마세요!

---

## 2. Kakao OAuth 설정

### 2.1 Kakao Developers 앱 생성

1. [Kakao Developers](https://developers.kakao.com/)에 접속합니다.
2. 우측 상단의 **"내 애플리케이션"**을 클릭합니다.
3. **"애플리케이션 추가하기"**를 클릭합니다.
4. 앱 이름을 입력하고 (예: `Babycare AI`) **"저장"**을 클릭합니다.

### 2.2 플랫폼 추가

1. 생성한 앱을 클릭하여 상세 페이지로 이동합니다.
2. 좌측 메뉴에서 **"플랫폼"**을 선택합니다.
3. **"Web 플랫폼 등록"**을 클릭합니다.
4. 사이트 도메인에 다음을 입력하고 **"저장"**을 클릭합니다:
   ```
   http://localhost:3000
   ```

### 2.3 Redirect URI 등록

1. 좌측 메뉴에서 **"제품 설정" > "카카오 로그인"**을 선택합니다.
2. **"카카오 로그인 활성화"**를 **ON**으로 설정합니다.
3. **"Redirect URI"** 섹션에서 **"Redirect URI 등록"**을 클릭합니다.
4. 다음 URI를 입력하고 **"저장"**을 클릭합니다:
   ```
   http://localhost:3000/api/auth/callback/kakao
   ```

### 2.4 동의 항목 설정

1. 좌측 메뉴에서 **"제품 설정" > "카카오 로그인" > "동의항목"**을 선택합니다.
2. 다음 항목을 **필수 동의**로 설정합니다:
   - **닉네임** (profile_nickname)
   - **카카오계정(이메일)** (account_email)
3. **"저장"**을 클릭합니다.

### 2.5 환경 변수 설정

1. 앱 상세 페이지로 돌아가서 **"앱 키"** 섹션을 확인합니다.
2. **REST API 키**를 복사합니다.
3. 좌측 메뉴에서 **"제품 설정" > "카카오 로그인" > "보안"**을 선택합니다.
4. **Client Secret 코드**를 생성하고 복사합니다.
5. `.env` 파일에 다음을 추가합니다:

```env
# Kakao OAuth
KAKAO_CLIENT_ID=""
KAKAO_CLIENT_SECRET=""
```

> **참고**: Kakao의 경우 Client ID는 REST API 키를, Client Secret은 보안 탭에서 생성한 코드를 사용합니다.

---

## 3. 배포 환경 설정 (Production)

### 3.1 Google 배포 환경 추가

1. Google Cloud Console의 **"사용자 인증 정보"**로 이동합니다.
2. 생성한 OAuth 2.0 클라이언트 ID를 클릭합니다.
3. **승인된 자바스크립트 원본**에 배포 URL을 추가합니다:
   ```
   https://yourdomain.com
   ```
4. **승인된 리디렉션 URI**에 배포 환경 콜백 URL을 추가합니다:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

### 3.2 Kakao 배포 환경 추가

1. Kakao Developers의 **"플랫폼"** 설정으로 이동합니다.
2. 사이트 도메인에 배포 URL을 추가합니다:
   ```
   https://yourdomain.com
   ```
3. **"Redirect URI"** 설정에 배포 환경 콜백 URL을 추가합니다:
   ```
   https://yourdomain.com/api/auth/callback/kakao
   ```

---

## 4. 환경 변수 최종 확인

`.env` 파일에 모든 OAuth 관련 환경 변수가 추가되어 있는지 확인하세요:

```env
# NextAuth.js Secret
NEXTAUTH_SECRET="YrFJ2ie5g2KwihkXU"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Kakao OAuth
KAKAO_CLIENT_ID="your-kakao-rest-api-key"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
```

---

## 5. 테스트

1. 개발 서버를 실행합니다:
   ```bash
   npm run dev
   ```

2. `http://localhost:3000/login`으로 이동합니다.

3. Google 또는 Kakao 로그인 버튼을 클릭하여 인증 흐름을 테스트합니다.

---

## 6. 문제 해결

### Google 로그인 오류

- **"redirect_uri_mismatch"**: 승인된 리디렉션 URI가 정확히 일치하는지 확인하세요.
- **"invalid_client"**: Client ID와 Client Secret이 정확한지 확인하세요.

### Kakao 로그인 오류

- **"KOE006"**: Redirect URI가 등록되어 있는지 확인하세요.
- **"KOE320"**: 동의 항목이 올바르게 설정되어 있는지 확인하세요.

---

## 참고 문서

- [NextAuth.js 공식 문서](https://next-auth.js.org/)
- [Google OAuth 2.0 가이드](https://developers.google.com/identity/protocols/oauth2)
- [Kakao 로그인 REST API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
