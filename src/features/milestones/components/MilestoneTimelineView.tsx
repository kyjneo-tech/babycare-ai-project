'use client';

/**
 * MilestoneTimelineView 컴포넌트
 *
 * 발달 이정표를 스와이프 가능한 타임라인 형태로 표시
 * - Embla Carousel을 사용한 스와이프 네비게이션
 * - 현재 아기 개월수에 맞는 이정표 자동 강조
 * - 모바일 최적화
 */

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {
  DEVELOPMENTAL_MILESTONES,
  calculateAgeInMonths,
  getRecommendedMilestoneId,
} from '@/shared/templates/developmental-milestones-v2';
import { MilestoneCard } from './MilestoneCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MilestoneTimelineViewProps {
  babyBirthDate: Date;
}

export function MilestoneTimelineView({ babyBirthDate }: MilestoneTimelineViewProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    skipSnaps: false,
    dragFree: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // 현재 아기 개월수 계산
  const ageInMonths = calculateAgeInMonths(babyBirthDate);
  const recommendedMilestoneId = getRecommendedMilestoneId(ageInMonths);

  // 스크롤 가능 여부 업데이트
  const updateScrollButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  // 선택된 인덱스 업데이트
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    updateScrollButtons();
  }, [emblaApi, updateScrollButtons]);

  // 이전 슬라이드로 이동
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  // 다음 슬라이드로 이동
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // 특정 슬라이드로 이동
  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  // Embla API 초기화 및 이벤트 리스너 등록
  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // 권장 이정표로 자동 스크롤 (초기 로드 시)
  useEffect(() => {
    if (!emblaApi) return;

    const recommendedIndex = DEVELOPMENTAL_MILESTONES.findIndex(
      m => m.id === recommendedMilestoneId
    );

    if (recommendedIndex !== -1) {
      emblaApi.scrollTo(recommendedIndex, false);
    }
  }, [emblaApi, recommendedMilestoneId]);

  return (
    <div className="space-y-6">
      {/* 헤더: 현재 개월수 표시 */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <span>🎂</span>
          <span>우리 아기는 현재 {ageInMonths}개월이에요</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          이 시기에는 이런 발달을 해요
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {DEVELOPMENTAL_MILESTONES.map((milestone, index) => (
          <Button
            key={milestone.id}
            variant={selectedIndex === index ? 'default' : 'outline'}
            size="sm"
            onClick={() => scrollTo(index)}
            className={cn(
              'min-w-[80px]',
              milestone.id === recommendedMilestoneId && selectedIndex !== index && 'border-yellow-400'
            )}
          >
            {milestone.ageMonths}개월
            {milestone.id === recommendedMilestoneId && selectedIndex !== index && ' ⭐'}
          </Button>
        ))}
      </div>

      {/* Embla Carousel */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {DEVELOPMENTAL_MILESTONES.map(milestone => (
              <div
                key={milestone.id}
                className="flex-[0_0_100%] min-w-0 md:flex-[0_0_90%] lg:flex-[0_0_80%]"
              >
                <MilestoneCard
                  milestone={milestone}
                  isRecommended={milestone.id === recommendedMilestoneId}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 이전/다음 버튼 (데스크톱) */}
        <div className="hidden md:block">
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 rounded-full shadow-lg"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 rounded-full shadow-lg"
            onClick={scrollNext}
            disabled={!canScrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 점 네비게이션 (모바일) */}
      <div className="flex justify-center gap-2 md:hidden">
        {DEVELOPMENTAL_MILESTONES.map((milestone, index) => (
          <button
            key={milestone.id}
            className={cn(
              'h-2 rounded-full transition-all',
              selectedIndex === index ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
            )}
            onClick={() => scrollTo(index)}
            aria-label={`${milestone.ageMonths}개월 이정표로 이동`}
          />
        ))}
      </div>

      {/* 안내 메시지 */}
      <div className="text-center text-sm text-muted-foreground">
        <p>💡 좌우로 스와이프하거나 버튼을 눌러 다른 연령대를 확인하세요</p>
      </div>
    </div>
  );
}
