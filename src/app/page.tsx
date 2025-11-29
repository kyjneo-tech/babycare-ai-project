// src/app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaFamilyRepository } from "@/features/families/repositories/PrismaFamilyRepository";
import { Container } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateBabyForm } from "@/features/babies/components/CreateBabyForm";
import { TYPOGRAPHY } from "@/design-system";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // 1. 세션 확인: 없으면 로그인 페이지로
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/");
  }

  // 2. 가족 및 아기 정보 조회
  const familyRepository = new PrismaFamilyRepository();
  const family = await familyRepository.findFamilyDetailsByUserId(session.user.id);
  const babies = family?.Babies ?? [];
  const mainBaby = babies[0];

  // 3. 아기가 없으면 '아기 추가' 페이지로 리다이렉트
  if (!mainBaby) {
    // 아기 등록 폼을 직접 보여주는 방식으로 변경
    return (
      <Container>
        <Card className="mt-8">
          <CardHeader className="text-center">
            <CardTitle className={TYPOGRAPHY.h2}>아기를 등록해주세요</CardTitle>
            <CardDescription>
              육아 기록을 시작하려면 먼저 아기 정보를 등록해야 합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateBabyForm />
          </CardContent>
        </Card>
      </Container>
    );
  }

  // 4. 아기가 있으면 /babies/[id] 페이지로 리다이렉트
  redirect(`/babies/${mainBaby.id}`);
}
