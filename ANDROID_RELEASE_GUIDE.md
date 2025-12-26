# 📱 BebeKnock 안드로이드 앱 출시 가이드

## ✅ 완료된 항목

- ✅ 앱 이름 변경: `babycareai` → `BebeKnock`
- ✅ 필수 권한 추가 (카메라, 사진, 알림)
- ✅ 개인정보 처리방침 링크 추가
- ✅ 버전 정보 업데이트 (v1.0.0)
- ✅ **ProGuard 최적화 활성화** (코드 난독화 및 사이즈 축소)
- ✅ **capacitor.config.ts 환경변수화** (Google OAuth Client ID)
- ✅ **PWA Manifest 개선** (카테고리, shortcuts 추가)
- ✅ **전역 에러 바운더리 추가** (error.tsx, global-error.tsx)
- ✅ **이미지 최적화 검증** (아이콘 크기 및 포맷)

---

## 🔐 5. Release 서명 키 생성 (필수)

### Step 1: 키 스토어 파일 생성

```bash
cd android/app

# 키 스토어 생성
keytool -genkey -v -keystore bebeknock-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias bebeknock-key

# 정보 입력 프롬프트:
# - 키 스토어 비밀번호: [안전한 비밀번호 입력]
# - 이름: BebeKnock
# - 조직 단위: Development
# - 조직: [회사명]
# - 구/군/시: Seoul
# - 시/도: Seoul
# - 국가 코드: KR
```

**⚠️ 중요**:
- 생성된 `bebeknock-release-key.jks` 파일을 **절대 Git에 커밋하지 마세요**
- 비밀번호를 **안전한 곳에 보관**하세요 (분실 시 앱 업데이트 불가능)

### Step 2: gradle.properties 파일 생성

```bash
# android/gradle.properties 파일 생성 (또는 기존 파일에 추가)
cat >> android/gradle.properties << EOF

# Release signing config
BEBEKNOCK_RELEASE_STORE_FILE=bebeknock-release-key.jks
BEBEKNOCK_RELEASE_KEY_ALIAS=bebeknock-key
BEBEKNOCK_RELEASE_STORE_PASSWORD=[위에서 입력한 비밀번호]
BEBEKNOCK_RELEASE_KEY_PASSWORD=[위에서 입력한 비밀번호]
EOF
```

**⚠️ 중요**: `gradle.properties` 파일도 `.gitignore`에 추가하세요

### Step 3: build.gradle 수정

`android/app/build.gradle` 파일에 다음 내용 추가:

```gradle
android {
    // ... 기존 설정 ...

    signingConfigs {
        release {
            if (project.hasProperty('BEBEKNOCK_RELEASE_STORE_FILE')) {
                storeFile file(BEBEKNOCK_RELEASE_STORE_FILE)
                storePassword BEBEKNOCK_RELEASE_STORE_PASSWORD
                keyAlias BEBEKNOCK_RELEASE_KEY_ALIAS
                keyPassword BEBEKNOCK_RELEASE_KEY_PASSWORD
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 4: .gitignore 업데이트

```bash
# 프로젝트 루트의 .gitignore에 추가
echo "
# Release signing
*.jks
*.keystore
gradle.properties
" >> .gitignore
```

### Step 5: Release APK/AAB 빌드

```bash
# APK 빌드 (테스트용)
cd android
./gradlew assembleRelease

# 생성 위치: android/app/build/outputs/apk/release/app-release.apk

# AAB 빌드 (Play Store 출시용, 권장)
./gradlew bundleRelease

# 생성 위치: android/app/build/outputs/bundle/release/app-release.aab
```

---

## 📸 6. Play Store 스크린샷 준비

### 필수 에셋

#### 1. 앱 스크린샷
- **폰 스크린샷**: 최소 2개, 권장 4-8개
- **크기**: 1080 x 1920 픽셀 (16:9 비율)
- **형식**: PNG 또는 JPG (각 8MB 이하)

**권장 스크린샷**:
1. 메인 화면 (활동 기록)
2. AI 채팅 화면
3. 통계/성장 차트
4. 일정 관리
5. 가족 초대 기능

#### 2. Feature Graphic (필수)
- **크기**: 1024 x 500 픽셀
- **형식**: PNG 또는 JPG
- **내용**: 앱 로고 + 핵심 기능 텍스트

#### 3. 앱 아이콘
- **크기**: 512 x 512 픽셀
- **형식**: PNG (투명 배경)
- **위치**: `public/BebeKnock.png` (이미 존재)

### 스크린샷 캡처 방법

**방법 1: Android Emulator 사용**
```bash
# 에뮬레이터 실행
cd android
./gradlew installDebug

# Android Studio > Tools > Device Manager > Screenshot
```

**방법 2: 실제 디바이스 사용**
```bash
# ADB로 스크린샷 캡처
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./screenshot.png
```

**방법 3: 디자인 도구 사용**
- [Figma Device Mockups](https://www.figma.com/templates/device-mockup/)
- [Screely](https://www.screely.com/)
- [MockuPhone](https://mockuphone.com/)

---

## 📝 7. Play Console 제출 체크리스트

### 앱 정보

#### 1. 앱 제목
```
BebeKnock - AI 육아 비서
```

#### 2. 짧은 설명 (80자 이내)
```
아기 성장을 기록하고 AI가 육아 고민을 해결해드립니다
```

#### 3. 전체 설명 (4000자 이내)
```
📱 BebeKnock - 당신의 AI 육아 파트너

BebeKnock은 아기의 성장을 체계적으로 기록하고,
인공지능이 맞춤형 육아 가이드를 제공하는 스마트한 육아 앱입니다.

🌟 주요 기능

✅ 간편한 활동 기록
• 수유, 수면, 배변, 체온 등 원터치 기록
• 타임라인으로 하루 활동 한눈에 확인
• 가족 구성원 모두가 함께 기록 공유

📊 성장 발달 추적
• 키와 체중 성장 곡선 자동 생성
• WHO 기준 백분위 비교
• 발달 이정표 알림

🤖 AI 육아 상담
• 24시간 실시간 AI 상담
• 아기 데이터 기반 맞춤형 조언
• 예방접종, 건강검진 일정 관리

👨‍👩‍👧 가족 공유
• QR 코드로 쉬운 가족 초대
• 실시간 동기화
• 역할별 권한 관리

🔒 안전한 데이터 관리
• 엔드투엔드 암호화
• 개인정보 보호 준수
• 클라우드 자동 백업

💡 이런 분들께 추천합니다
• 처음 육아를 시작하는 부모님
• 체계적인 기록을 원하는 부모님
• 조부모와 함께 육아하는 가정
• 쌍둥이/다둥이 육아 중인 가정

🎯 BebeKnock과 함께
더 이상 육아 고민을 혼자 안고 계시지 마세요.
AI가 당신의 든든한 육아 파트너가 되어드립니다.

지금 바로 다운로드하고 체험해보세요! ✨

---

개인정보 처리방침: https://babycare-ai.vercel.app/privacy-policy
이용약관: https://babycare-ai.vercel.app/terms-of-service
문의: [이메일 주소 추가]
```

#### 4. 앱 카테고리
```
주 카테고리: 육아
부 카테고리: 건강 및 피트니스
```

#### 5. 콘텐츠 등급
```
ESRB: Everyone
PEGI: 3+
타겟 연령: 만 3세 이상 (부모용 앱)
```

#### 6. 개인정보 처리방침 URL
```
https://babycare-ai.vercel.app/privacy-policy
```

### 데이터 보안 섹션

#### 수집하는 데이터
- ✅ 개인 정보 (이름, 이메일)
- ✅ 건강 정보 (아기 키, 체중, 활동 기록)
- ✅ 사진 및 동영상
- ✅ 앱 활동 (사용 기록)

#### 데이터 사용 목적
- 앱 기능 제공
- 맞춤형 서비스 제공
- 서비스 개선

#### 데이터 공유
- ❌ 제3자와 공유하지 않음
- ✅ 암호화 전송
- ✅ 사용자가 데이터 삭제 가능

---

## 🚀 최종 제출 전 확인사항

### 기술적 요구사항
- [x] ProGuard 최적화 활성화 (코드 난독화 및 사이즈 축소)
- [x] 전역 에러 바운더리 설정 (error.tsx, global-error.tsx)
- [ ] Release APK/AAB 서명 완료
- [ ] 최소 2개 이상의 디바이스에서 테스트
- [ ] 크래시 없음 확인
- [ ] 메모리 누수 확인 (Android Profiler)
- [ ] 네트워크 오류 처리 확인
- [ ] 오프라인 모드 동작 확인

### 콘텐츠 요구사항
- [x] PWA Manifest 개선 (카테고리, shortcuts 추가)
- [x] 앱 아이콘 최적화 (192x192, 512x512)
- [ ] 스크린샷 최소 2개 (권장 4-8개)
- [ ] Feature Graphic (1024x500)
- [ ] 앱 아이콘 512x512 (Play Console용)
- [x] 개인정보 처리방침 URL 유효
- [x] 앱 설명 작성 완료

### 법적 요구사항
- [ ] 개인정보 처리방침 페이지 접근 가능
- [ ] 이용약관 페이지 접근 가능
- [ ] 데이터 보안 섹션 작성 완료
- [ ] 콘텐츠 등급 신청 완료

### 비즈니스 요구사항
- [ ] Google Play 개발자 계정 생성 ($25 일회성 비용)
- [ ] 판매자 계정 등록 (유료 앱 판매 시)
- [ ] 지원 이메일 주소 준비

---

## 📞 추가 지원

### 문제 발생 시
1. **빌드 실패**: `./gradlew clean` 후 재시도
2. **서명 오류**: gradle.properties 경로 확인
3. **권한 오류**: AndroidManifest.xml 확인

### 유용한 명령어
```bash
# 빌드 정보 확인
./gradlew tasks

# 의존성 확인
./gradlew dependencies

# 캐시 삭제
./gradlew clean

# 연결된 디바이스 확인
adb devices
```

---

**마지막 업데이트**: 2025-12-26
**버전**: 1.0.0

---

## 🎯 2025-12-26 최종 점검 완료 항목

### 보안 개선
- ✅ capacitor.config.ts - Google OAuth Client ID 환경변수화
- ✅ ProGuard 규칙 추가 (Capacitor WebView 보호)

### 성능 최적화
- ✅ ProGuard minifyEnabled: true
- ✅ shrinkResources: true (미사용 리소스 제거)
- ✅ proguard-android-optimize.txt 적용

### PWA 개선
- ✅ manifest.json - 카테고리 추가 (health, lifestyle, productivity)
- ✅ App Shortcuts 추가 (빠른 수유/기저귀 기록, 통계)
- ✅ 다국어 설정 (lang: ko-KR)

### 에러 처리
- ✅ global-error.tsx 추가 (root layout 에러 처리)
- ✅ error.tsx 이미 구현됨
- ✅ not-found.tsx 이미 구현됨

### 다음 단계 (Todo)
1. **스크린샷 캡처** - 최소 4개 이상 (대시보드, 통계, 일정, 가족 초대)
2. **Feature Graphic 제작** - 1024x500 픽셀
3. **Release 키 생성** - bebeknock-release-key.jks
4. **AAB 빌드** - `./gradlew bundleRelease`
5. **실제 디바이스 테스트** - 최소 2개 이상
6. **Play Console 제출** - 앱 정보 입력 및 심사 요청
