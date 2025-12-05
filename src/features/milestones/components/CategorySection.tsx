/**
 * CategorySection 컴포넌트
 *
 * 발달 이정표의 각 카테고리(사회/정서, 언어, 대근육, 소근육)를 표시
 */

import { CategoryInfo, CATEGORY_COLORS, MilestoneCategory } from '@/shared/templates/developmental-milestones-v2';
import { cn } from '@/lib/utils';

interface CategorySectionProps {
  category: MilestoneCategory;
  categoryInfo: CategoryInfo;
}

export function CategorySection({ category, categoryInfo }: CategorySectionProps) {
  const colors = CATEGORY_COLORS[category];

  return (
    <div className="space-y-3">
      {/* 카테고리 헤더 */}
      <div className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">
          {categoryInfo.icon}
        </span>
        <h3 className={cn('text-lg font-semibold', colors.text)}>
          {categoryInfo.label}
        </h3>
      </div>

      {/* 발달 항목 리스트 */}
      <ul className="space-y-2 pl-1">
        {categoryInfo.items.map((item, index) => (
          <li
            key={`${category}-${index}`}
            className={cn(
              'flex items-start gap-2 rounded-lg border p-3 transition-colors',
              colors.bg,
              colors.border,
              'hover:shadow-sm'
            )}
          >
            {/* 항목 아이콘 */}
            <span className={cn('mt-0.5 text-sm', colors.text)} aria-hidden="true">
              •
            </span>

            {/* 항목 텍스트 */}
            <span className="flex-1 text-base leading-relaxed text-gray-800">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
