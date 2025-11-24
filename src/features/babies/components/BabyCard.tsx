"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteBaby } from "@/features/babies/actions";
import { useRouter } from "next/navigation";

interface Baby {
  id: string;
  name: string;
  birthDate: Date;
  gender: string;
}

export function BabyCard({ baby }: { baby: Baby }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (
      !confirm(
        `${baby.name}을(를) 정말 삭제하시겠습니까? 관련된 모든 활동 기록도 함께 삭제됩니다.`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const result = await deleteBaby(baby.id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "삭제에 실패했습니다.");
      }
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <Link href={`/dashboard/babies/${baby.id}`}>
        <div className="flex items-center space-x-4 cursor-pointer">
          <div className="text-4xl">
            {baby.gender === "male" ? "👶‍♂️" : "👶‍♀️"}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800">{baby.name}</h3>
            <p className="text-sm text-gray-500">
              {new Date(baby.birthDate).toLocaleDateString("ko-KR")} 출생
            </p>
          </div>
        </div>
      </Link>
      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
        <Link
          href={`/dashboard/babies/${baby.id}`}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-center text-sm font-medium transition"
        >
          기록 보기
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-2 px-3 rounded text-sm font-medium transition"
          title="삭제"
        >
          {deleting ? "..." : "삭제"}
        </button>
      </div>
    </div>
  );
}
