/**
 * Todos Page
 * 투두 전용 페이지
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TodoList } from "@/features/notes/components/TodoList";

export default async function TodosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/notes");
  }

  // 첫 번째 아기 가져오기
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      FamilyMembers: {
        select: {
          Family: {
            select: {
              Babies: true,
            },
          },
        },
      },
    },
  });

  const babies = user?.FamilyMembers[0]?.Family?.Babies ?? [];
  const mainBaby = babies[0];

  if (!mainBaby) {
    redirect("/");
  }

  // 투두만 가져오기
  const todos = await prisma.note.findMany({
    where: {
      babyId: mainBaby.id,
      type: 'TODO',  // 투두만!
    },
    include: {
      User: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      { completed: 'asc' },
      { priority: 'desc' },
      { dueDate: 'asc' },
      { createdAt: 'desc' },
    ],
    take: 200,
  });

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            홈으로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold">할 일 관리 📝</h1>
          <p className="text-gray-600 mt-1">
            {mainBaby.name}의 모든 할 일을 확인하세요
          </p>
        </div>

        {/* 투두 목록 */}
        <TodoList 
          initialTodos={todos}
          babyId={mainBaby.id}
          userId={session.user.id}
        />
      </div>
    </main>
  );
}
