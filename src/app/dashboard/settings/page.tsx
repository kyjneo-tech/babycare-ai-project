import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SettingsPanel } from "@/components/features/settings/SettingsPanel";

export const metadata = {
  title: "설정 | Babycare AI",
  description: "앱 환경을 맞춤 설정하세요.",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  // 세션이 없으면 로그인 페이지로 리다이렉트
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/settings");
  }

  return <SettingsPanel />;
}

