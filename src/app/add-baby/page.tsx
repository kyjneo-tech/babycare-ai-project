// src/app/add-baby/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { CreateBabyForm } from '@/features/babies/components/CreateBabyForm';
import { MobileContainer } from '@/components/layout';
import { Calendar, Clock, Sparkles } from "lucide-react";

export default async function AddBabyPage() {
  const session = await getServerSession(authOptions);

  // 세션이 없으면 로그인 페이지로 리다이렉트
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/add-baby");
  }

  return (
    <MobileContainer>
      <div className="bg-slate-800/50 p-8 rounded-lg shadow-md border border-white/10">
        <h1 className="text-2xl font-semibold text-center mb-3 text-slate-100">
          새로운 아기 등록
        </h1>

        {/* 안내 문구 */}
        <div className="mb-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-slate-200">
              등록 시 자동 제공
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm text-slate-300">
              <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>24개월까지 예방접종·건강검진 일정</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-300">
              <Clock className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <span>개월수별 권장 수면 시간</span>
            </div>
          </div>
        </div>

        <CreateBabyForm />
      </div>
    </MobileContainer>
  );
}

