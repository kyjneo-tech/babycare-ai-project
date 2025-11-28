// src/app/add-baby/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { CreateBabyForm } from '@/features/babies/components/CreateBabyForm';
import { Calendar, Clock, Sparkles } from "lucide-react";

export default async function AddBabyPage() {
  const session = await getServerSession(authOptions);

  // 세션이 없으면 로그인 페이지로 리다이렉트
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/add-baby");
  }

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold text-center mb-3">
            새로운 아기 등록
          </h1>

          {/* 안내 문구 */}
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-gray-700">
                등록 시 자동 제공
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>24개월까지 예방접종·건강검진 일정</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <span>개월수별 권장 수면 시간</span>
              </div>
            </div>
          </div>

          <CreateBabyForm />
        </div>
      </div>
    </main>
  );
}

