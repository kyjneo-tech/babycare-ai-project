import { CategoryInfo, MilestoneCategory, CATEGORY_COLORS } from '@/shared/templates/developmental-milestones-v2';

interface CompactCategoryRowProps {
  category: MilestoneCategory;
  categoryInfo: CategoryInfo;
}

export function CompactCategoryRow({ category, categoryInfo }: CompactCategoryRowProps) {
  const colors = CATEGORY_COLORS[category];

  return (
    <div className="flex items-start gap-2 text-sm">
      {/* 아이콘 */}
      <span className="text-base flex-shrink-0">{categoryInfo.icon}</span>

      {/* 항목들 - 한 줄로 표시 */}
      <div className="flex-1">
        <span className={`font-medium ${colors.text}`}>
          {categoryInfo.label}:
        </span>{' '}
        <span className="text-gray-700">
          {categoryInfo.items.join(' · ')}
        </span>
      </div>
    </div>
  );
}
