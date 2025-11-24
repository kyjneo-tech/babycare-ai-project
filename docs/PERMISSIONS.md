# 권한 관리 시스템 가이드

## 개요

Babycare AI는 역할 기반 접근 제어(RBAC)를 사용하여 가족 구성원의 권한을 관리합니다.

## 역할 계층

### 1. Owner (소유자)
- 가족을 생성한 사람에게 자동으로 부여
- **모든 권한** 보유
- 다른 Owner를 생성할 수 없음 (각 가족당 1명의 Owner만 존재)

**주요 권한:**
- ✅ 가족 삭제
- ✅ 구성원 제거 (본인 제외)
- ✅ 구성원 역할 변경
- ✅ 초대 코드 생성
- ✅ 아기 추가/수정/삭제
- ✅ 기록 추가/수정/삭제
- ✅ 가족 정보 수정

### 2. Admin (관리자)
- Owner가 지정한 관리자
- 구성원 관리를 제외한 대부분의 권한 보유

**주요 권한:**
- ✅ 초대 코드 생성
- ✅ 아기 추가/수정/삭제
- ✅ 기록 추가/수정/삭제
- ✅ 가족 정보 수정
- ❌ 구성원 제거 불가
- ❌ 역할 변경 불가
- ❌ 가족 삭제 불가

### 3. Member (일반 구성원)
- 일상적인 육아 기록을 관리하는 구성원

**주요 권한:**
- ✅ 아기 정보 추가/수정
- ✅ 기록 추가/수정/삭제
- ✅ 알림 설정 변경
- ❌ 아기 삭제 불가
- ❌ 초대 코드 생성 불가
- ❌ 가족 정보 수정 불가

### 4. Read-Only (읽기 전용)
- 정보만 확인하는 구성원 (예: 조부모님)

**주요 권한:**
- ✅ 아기 정보 보기
- ✅ 기록 보기
- ✅ 구성원 목록 보기
- ✅ 분석 및 통계 보기
- ✅ AI 챗봇 사용
- ❌ 모든 쓰기 작업 불가

## 권한 함수 사용법

### 기본 사용법

```typescript
import { canInviteMembers, canEditBaby, type Role } from "@/lib/permissions";

// 사용자 역할 확인
const userRole: Role = familyMember.role as Role;

// 권한 체크
if (canInviteMembers(userRole)) {
  // 초대 코드 생성 로직
} else {
  // 권한 없음 에러 처리
}
```

### API Route에서 사용

```typescript
import { canEditBaby, type Role } from "@/lib/permissions";

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // ... 사용자 및 가족 멤버십 조회 ...

  // 권한 확인
  if (!canEditBaby(familyMember.role as Role)) {
    return NextResponse.json(
      { error: "아기 정보를 수정할 권한이 없습니다." },
      { status: 403 }
    );
  }

  // 권한이 있는 경우 처리 로직
}
```

### Client Component에서 사용

```typescript
"use client";

import { canAddRecord, type Role } from "@/lib/permissions";

function BabyRecordForm({ userRole }: { userRole: Role }) {
  const canAdd = canAddRecord(userRole);

  if (!canAdd) {
    return <p>기록을 추가할 권한이 없습니다.</p>;
  }

  return (
    <form>
      {/* 기록 추가 폼 */}
    </form>
  );
}
```

## 주요 권한 함수 목록

### 가족 관리
- `canInviteMembers(role)` - 초대 코드 생성 권한
- `canRemoveMembers(role)` - 구성원 제거 권한
- `canDeleteFamily(role)` - 가족 삭제 권한
- `canChangeRole(role)` - 역할 변경 권한
- `canEditFamilyInfo(role)` - 가족 정보 수정 권한

### 아기 관리
- `canAddBaby(role)` - 아기 추가 권한
- `canEditBaby(role)` - 아기 정보 수정 권한
- `canDeleteBaby(role)` - 아기 삭제 권한
- `canViewBaby(role)` - 아기 정보 보기 권한

### 기록 관리
- `canAddRecord(role)` - 기록 추가 권한
- `canEditRecord(role)` - 기록 수정 권한
- `canDeleteRecord(role)` - 기록 삭제 권한
- `canViewRecords(role)` - 기록 보기 권한

### 기타
- `canUseChatbot(role)` - AI 챗봇 사용 권한
- `canViewAnalytics(role)` - 분석/통계 보기 권한
- `canEditNotificationSettings(role)` - 알림 설정 변경 권한
- `canRegenerateInviteCode(role)` - 초대 코드 재생성 권한

## 역할 비교 함수

### getRolePriority(role)
역할의 우선순위 숫자를 반환합니다.
- Owner: 4
- Admin: 3
- Member: 2
- Read-Only: 1

```typescript
import { getRolePriority } from "@/lib/permissions";

const ownerPriority = getRolePriority("Owner"); // 4
const memberPriority = getRolePriority("Member"); // 2
```

### hasHigherRole(currentRole, targetRole)
현재 역할이 대상 역할보다 높은 권한을 가지는지 확인합니다.

```typescript
import { hasHigherRole } from "@/lib/permissions";

// Owner가 Member보다 높은 권한을 가지는지 확인
const canManage = hasHigherRole("Owner", "Member"); // true

// Member가 Admin보다 높은 권한을 가지는지 확인
const canManage2 = hasHigherRole("Member", "Admin"); // false
```

## 권한 정보 조회

### rolePermissions 객체
각 역할의 설명과 권한 목록을 제공합니다.

```typescript
import { rolePermissions } from "@/lib/permissions";

console.log(rolePermissions.Owner);
// {
//   description: "가족 소유자",
//   permissions: [
//     "모든 권한",
//     "가족 삭제",
//     "구성원 제거",
//     ...
//   ]
// }
```

## 보안 고려사항

### 1. 서버 사이드 검증 필수
클라이언트에서의 권한 체크는 UI/UX 개선 목적이며, **반드시 API Route에서도 권한을 검증**해야 합니다.

```typescript
// ❌ 나쁜 예: 클라이언트에서만 체크
function handleDelete() {
  if (canDeleteBaby(userRole)) {
    await fetch("/api/babies/delete", { method: "DELETE" });
  }
}

// ✅ 좋은 예: 클라이언트 + 서버 모두 체크
// 클라이언트
function handleDelete() {
  if (canDeleteBaby(userRole)) {
    await fetch("/api/babies/delete", { method: "DELETE" });
  }
}

// 서버 (API Route)
export async function DELETE(request: NextRequest) {
  if (!canDeleteBaby(familyMember.role as Role)) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }
  // 삭제 로직
}
```

### 2. Owner 보호
- Owner는 자기 자신을 제거할 수 없습니다
- Owner는 다른 Owner를 생성할 수 없습니다
- Owner의 역할은 변경할 수 없습니다

### 3. 역할 변경 제한
- Owner만 역할을 변경할 수 있습니다
- Owner 역할로 변경할 수 없습니다

## 예제: 구성원 관리 API

```typescript
// src/app/api/families/members/[memberId]/route.ts
import { canRemoveMembers, type Role } from "@/lib/permissions";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  const session = await getServerSession(authOptions);

  // 1. 인증 확인
  if (!session?.user?.email) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  // 2. 현재 사용자의 가족 멤버십 조회
  const currentUserMembership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: user.id, familyId } }
  });

  // 3. 권한 확인
  if (!canRemoveMembers(currentUserMembership.role as Role)) {
    return NextResponse.json(
      { error: "구성원을 제거할 권한이 없습니다." },
      { status: 403 }
    );
  }

  // 4. 추가 검증 (Owner 제거 방지, 자기 자신 제거 방지)
  const targetMember = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: memberId, familyId } }
  });

  if (targetMember.role === "Owner") {
    return NextResponse.json(
      { error: "Owner는 제거할 수 없습니다." },
      { status: 400 }
    );
  }

  if (memberId === user.id) {
    return NextResponse.json(
      { error: "자기 자신은 제거할 수 없습니다." },
      { status: 400 }
    );
  }

  // 5. 구성원 제거
  await prisma.familyMember.delete({
    where: { userId_familyId: { userId: memberId, familyId } }
  });

  return NextResponse.json({ message: "구성원이 제거되었습니다." });
}
```

## 테스트 시나리오

### Owner 테스트
1. ✅ 가족 생성 시 자동으로 Owner 역할 부여
2. ✅ Owner가 Admin 역할 지정
3. ✅ Owner가 Member 제거
4. ✅ Owner가 가족 삭제
5. ❌ Owner가 자기 자신 제거 시도 → 실패
6. ❌ Owner를 다른 역할로 변경 시도 → 실패

### Admin 테스트
1. ✅ Admin이 초대 코드 생성
2. ✅ Admin이 아기 정보 수정
3. ❌ Admin이 구성원 제거 시도 → 실패
4. ❌ Admin이 역할 변경 시도 → 실패

### Member 테스트
1. ✅ Member가 수유 기록 추가
2. ✅ Member가 아기 이름 수정
3. ❌ Member가 아기 삭제 시도 → 실패
4. ❌ Member가 초대 코드 생성 시도 → 실패

### Read-Only 테스트
1. ✅ Read-Only가 아기 정보 조회
2. ✅ Read-Only가 통계 보기
3. ❌ Read-Only가 기록 추가 시도 → 실패
4. ❌ Read-Only가 아기 정보 수정 시도 → 실패

## 문제 해결

### "권한이 없습니다" 오류
1. 사용자의 현재 역할 확인
2. 해당 작업에 필요한 권한 확인
3. 가족 멤버십이 올바르게 설정되었는지 확인

### 역할 변경 실패
1. Owner만 역할을 변경할 수 있습니다
2. Owner 역할로는 변경할 수 없습니다
3. 본인의 역할은 변경할 수 없습니다 (Owner 제외)

### 구성원 제거 실패
1. Owner만 구성원을 제거할 수 있습니다
2. Owner는 제거할 수 없습니다
3. 자기 자신은 제거할 수 없습니다

## 추가 리소스

- [NextAuth 인증 가이드](./OAUTH_SETUP.md)
- [Prisma 스키마](/prisma/schema.prisma)
- [권한 유틸리티 소스](/src/lib/permissions.ts)
