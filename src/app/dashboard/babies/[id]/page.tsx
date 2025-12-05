import { notFound } from 'next/navigation';
import { getBabyById } from '@/features/babies/actions';
import { MilestoneTimelineView } from '@/features/milestones/components/MilestoneTimelineView';
import { PageHeader } from '@/components/layout/PageHeader';

interface BabyDetailPageProps {
  params: { id: string };
}

export default async function BabyDetailPage({ params }: BabyDetailPageProps) {
  const result = await getBabyById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const baby = result.data;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* 페이지 헤더 */}
      <PageHeader
        title={`${baby.name}의 발달 이정표`}
        description="이 시기에는 이런 발달을 해요"
      />

      {/* 발달 이정표 타임라인 */}
      <MilestoneTimelineView babyBirthDate={new Date(baby.birthDate)} />
    </div>
  );
}
