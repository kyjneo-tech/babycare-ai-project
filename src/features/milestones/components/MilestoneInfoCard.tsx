'use client';

import { Note } from '@prisma/client';
import { DEVELOPMENTAL_MILESTONES } from '@/shared/templates/developmental-milestones-v2';
import { CompactCategoryRow } from './CompactCategoryRow';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MilestoneInfoCardProps {
  note: Note;
}

export function MilestoneInfoCard({ note }: MilestoneInfoCardProps) {
  // metadata에서 ageMonths 추출
  const metadata = note.metadata as { ageMonths?: number };
  const ageMonths = metadata?.ageMonths;

  // developmental-milestones-v2에서 매칭되는 데이터 찾기
  const milestoneData = DEVELOPMENTAL_MILESTONES.find(
    (m) => m.ageMonths === ageMonths
  );

  if (!milestoneData) {
    return (
      <Alert>
        <AlertDescription>
          발달 이정표 데이터를 찾을 수 없습니다.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3 mt-3 p-4 bg-gray-50 rounded-lg">
      {/* 제목 - 간소화 */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>🎯</span>
        <span>발달 이정표</span>
      </div>

      {/* 4가지 카테고리 - 컴팩트하게 */}
      <div className="space-y-2">
        <CompactCategoryRow
          category="social"
          categoryInfo={milestoneData.categories.social}
        />
        <CompactCategoryRow
          category="language"
          categoryInfo={milestoneData.categories.language}
        />
        <CompactCategoryRow
          category="grossMotor"
          categoryInfo={milestoneData.categories.grossMotor}
        />
        <CompactCategoryRow
          category="fineMotor"
          categoryInfo={milestoneData.categories.fineMotor}
        />
      </div>

      {/* 안내 메시지 - 작게 */}
      <p className="text-xs text-gray-500 mt-2">
        💡 발달은 개인차가 있습니다. 참고용 정보입니다.
      </p>
    </div>
  );
}
