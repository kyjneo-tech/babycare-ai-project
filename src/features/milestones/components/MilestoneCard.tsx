/**
 * MilestoneCard 컴포넌트
 *
 * 하나의 연령대(예: 6개월)에 대한 발달 이정표 카드
 * 4가지 카테고리를 모두 포함
 */

import { DevelopmentalMilestone } from '@/shared/templates/developmental-milestones-v2';
import { CategorySection } from './CategorySection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MilestoneCardProps {
  milestone: DevelopmentalMilestone;
  isRecommended?: boolean;
}

export function MilestoneCard({ milestone, isRecommended = false }: MilestoneCardProps) {
  return (
    <Card className="flex-shrink-0 w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <span>🎯</span>
            <span>{milestone.title}</span>
          </CardTitle>
          {isRecommended && (
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 border border-yellow-300">
              ⭐ 권장
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 사회/정서 발달 */}
        <CategorySection category="social" categoryInfo={milestone.categories.social} />

        {/* 언어 발달 */}
        <CategorySection category="language" categoryInfo={milestone.categories.language} />

        {/* 대근육 발달 */}
        <CategorySection category="grossMotor" categoryInfo={milestone.categories.grossMotor} />

        {/* 소근육 발달 */}
        <CategorySection category="fineMotor" categoryInfo={milestone.categories.fineMotor} />
      </CardContent>
    </Card>
  );
}
