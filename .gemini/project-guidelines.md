# 프로젝트 개발 가이드라인

## 🎯 핵심 개발 원칙 (TDD & SOLID)

### TDD (Test-Driven Development)
- **Red → Green → Refactor** 사이클 준수
- 테스트 작성 → 최소 구현 → 리팩토링 순서로 진행

### Tidy First
- **구조 변경(S)**과 **행동 변경(B)**을 엄격히 분리
- S를 B보다 먼저 수행
- 두 유형을 섞지 않음

### SOLID 원칙
- **SRP (Single Responsibility Principle)**: 함수/클래스는 하나의 책임만
- **OCP (Open-Closed Principle)**: 확장에는 열려있고 수정에는 닫혀있게
- **DIP (Dependency Inversion Principle)**: 추상화에 의존

### 데이터베이스
- **3NF (Third Normal Form)** 준수
- 중복 최소화

### UI 컴포넌트
- **shadcn/ui** 기반
- **DRY 원칙** 준수
- 재사용 가능한 컴포넌트 설계

---

## 📋 커밋 규율

1. **분리 원칙**
   - 구조 변경(S)과 행동 변경(B)을 절대 섞지 않음
   - 각각 별도 커밋

2. **테스트 통과 필수**
   - 모든 테스트가 통과할 때만 커밋
   - 기능 구현 후 반드시 실행:
     ```bash
     npm run test
     npm run build
     ```

3. **커밋 메시지**
   - 명확하고 구체적으로
   - 예: `[S] Extract validation logic to helper` / `[B] Add user authentication`

---

## 💬 커뮤니케이션 원칙

### 통제권
- **절대 먼저 진행하지 않음**
- 항상 사용자의 **go 명령 대기**

### 수정 제안 시
1. 사용자의 제안을 그대로 실행하지 않음
2. 사용성/유지보수/SOLID를 고려한 **개선된 제안** 제시
3. **승인 대기** 후 진행

### 디버깅
- 긍정적 메시지 사용
- 예: "버그 사냥 시간이에요! 🐛"

### 개념 설명
- 중요 개념은 **비유**를 들어 설명
- "잠깐! 중요한 개념이 나왔어요" 섹션 활용

---

## 🛠️ 개발 워크플로우

### 1. 계획 단계
- 요구사항 분석
- 테스트 케이스 작성
- 구조 변경 필요 여부 확인

### 2. 구조 변경 (S)
- 필요한 리팩토링 먼저 수행
- 테스트 통과 확인
- 커밋

### 3. 행동 변경 (B)
- 기능 구현
- 테스트 통과 확인
- 커밋

### 4. 검증
```bash
npm run test
npm run build
```

---

## 📚 참고 자료

- [TDD by Example - Kent Beck](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)
- [Tidy First? - Kent Beck](https://www.oreilly.com/library/view/tidy-first/9781098151232/)
- [Clean Code - Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

## ⚠️ 중요 알림

이 가이드라인은 **User Rules**에도 추가되어야 합니다.

**User Rules 추가 방법:**
1. Gemini Code Assist 설정 열기
2. "User Rules" 또는 "Memories" 섹션 찾기
3. 핵심 원칙 추가 (위 내용 중 요약본)
4. 저장

---

*Last Updated: 2025-12-04*
