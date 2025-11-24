// src/app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaFamilyRepository } from "@/features/families/repositories/PrismaFamilyRepository";
import { CreateBabyForm } from "@/features/babies/components/CreateBabyForm";
import { BabyCard } from "@/features/babies/components/BabyCard";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // 세션이 없으면 로그인 페이지로 리다이렉트
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const familyRepository = new PrismaFamilyRepository();
  const family = await familyRepository.findFamilyDetailsByUserId(session.user.id);
  const babies = family?.Babies ?? [];

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-gray-600 mt-1">
            {session.user.name}님, 환영합니다!
          </p>
        </div>

        {babies.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-center mb-2">
              아기를 등록해주세요
            </h2>
            <p className="text-center text-gray-500 mb-6">
              육아 기록을 시작하려면 먼저 아기 정보를 등록해야 합니다.
            </p>
            <CreateBabyForm />
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {babies.map((baby) => (
                <BabyCard key={baby.id} baby={baby} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/dashboard/add-baby"
                className="text-blue-600 hover:underline"
              >
                + 다른 아기 추가하기
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

