// src/app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaFamilyRepository } from "@/features/families/repositories/PrismaFamilyRepository";

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

  // 3. 아기가 없으면 /add-baby 페이지로 리다이렉트
  if (!mainBaby) {
    redirect("/add-baby");
  }

  // 4. 아기가 있으면 /babies/[id] 페이지로 리다이렉트
  redirect(`/babies/${mainBaby.id}`);
}
