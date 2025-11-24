// src/app/dashboard/add-baby/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { CreateBabyForm } from '@/features/babies/components/CreateBabyForm';

export default async function AddBabyPage() {
  const session = await getServerSession(authOptions);

  // 세션이 없으면 로그인 페이지로 리다이렉트
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/add-baby");
  }

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold text-center mb-6">
            새로운 아기 등록
          </h1>
          <CreateBabyForm />
        </div>
      </div>
    </main>
  );
}

