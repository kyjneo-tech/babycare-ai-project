// src/app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaFamilyRepository } from "@/features/families/repositories/PrismaFamilyRepository";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // 로그인한 사용자는 대시보드로 리다이렉트
  if (session?.user?.id) {
    const familyRepository = new PrismaFamilyRepository();
    const family = await familyRepository.findFamilyDetailsByUserId(session.user.id);
    const babies = family?.Babies ?? [];
    const mainBaby = babies[0];

    if (!mainBaby) {
      redirect("/add-baby");
    }

    redirect(`/babies/${mainBaby.id}`);
  }

  // 비로그인 사용자는 로그인 페이지로 리다이렉트 (앱 전용)
  redirect("/login");
}
