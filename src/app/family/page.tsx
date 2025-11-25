import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { FamilyManagementPage } from "@/components/features/families/FamilyManagementPage";

export const metadata = {
  title: "가족 관리 | Babycare AI",
  description: "공동 양육자들을 관리하고 초대하세요.",
};

export default async function FamilyPage() {
  const session = await getServerSession(authOptions);

  // 세션이 없으면 로그인 페이지로 리다이렉트
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/family");
  }

  return <FamilyManagementPage />;
}

