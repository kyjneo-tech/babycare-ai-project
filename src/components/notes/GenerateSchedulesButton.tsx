/**
 * 일정 자동 생성 버튼 컴포넌트
 */

'use client';

import { useState } from 'react';
import { generateSchedulesAction } from '@/features/notes/actions';
import { Loader2, Calendar } from 'lucide-react';

type GenerateSchedulesButtonProps = {
  babyId: string;
  babyName: string;
};

export function GenerateSchedulesButton({
  babyId,
  babyName,
}: GenerateSchedulesButtonProps) {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    if (confirm(`${babyName}의 예방접종, 건강검진 등 모든 일정을 자동 생성하시겠습니까?`)) {
      setLoading(true);
      try {
        const result = await generateSchedulesAction(babyId);
        if (result.success) {
          alert(`${result.data.count}개의 일정이 생성되었습니다!`);
          setGenerated(true);
          window.location.reload();
        } else {
          alert(`일정 생성 실패: ${result.error}`);
        }
      } catch (error) {
        console.error('Generate schedules error:', error);
        alert('일정 생성 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (generated) {
    return null;
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          생성 중...
        </>
      ) : (
        <>
          <Calendar className="h-4 w-4" />
          일정 자동 생성
        </>
      )}
    </button>
  );
}
