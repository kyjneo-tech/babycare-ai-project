"use client";

import { useState, useEffect } from "react";
import { getUpcomingSchedules } from "@/features/notes/actions";
import { Note } from "@prisma/client";
import { getNoteTypeDetails } from "@/shared/utils/note-helpers";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { ChevronRight } from "lucide-react";

interface CompactScheduleCarouselProps {
  babyId: string;
  limit?: number;
}

type ScheduleNote = Note & { daysUntil: number };

function ScheduleCard({ schedule, babyId }: { schedule: ScheduleNote; babyId: string }) {
  const details = getNoteTypeDetails(schedule.type);
  const isUrgent = schedule.daysUntil <= 14;
  const isToday = schedule.daysUntil === 0;

  const bgColor = isUrgent ? "bg-red-50" : "bg-blue-50";
  const borderColor = isUrgent ? "border-red-300" : "border-blue-200";
  const textColor = isUrgent ? "text-red-600" : "text-blue-600";

  const dDayText = isToday ? "D-Day" : `D-${schedule.daysUntil}`;

  return (
    <Link
      href={`/babies/${babyId}?tab=timeline`}
      className={`block ${bgColor} ${borderColor} border-2 rounded-lg p-2 hover:shadow-md transition-all cursor-pointer`}
    >
      {/* 초콤팩트 2줄 레이아웃 */}
      <div className="flex items-center gap-1.5 mb-0.5">
        {/* D-Day */}
        <span className={`text-xs font-bold ${textColor} shrink-0`}>
          {dDayText}
        </span>
        {/* 아이콘 */}
        <span className="text-base shrink-0">{details.icon}</span>
        {/* 제목 */}
        <h4 className="font-semibold text-sm text-gray-900 truncate">
          {schedule.title}
        </h4>
      </div>

      {/* 날짜 */}
      {schedule.dueDate && (
        <p className="text-xs text-gray-500 pl-0.5">
          {new Date(schedule.dueDate).toLocaleDateString('ko-KR', {
            month: 'numeric',
            day: 'numeric',
            weekday: 'short'
          })}
        </p>
      )}
    </Link>
  );
}

export function CompactScheduleCarousel({
  babyId,
  limit = 6,
}: CompactScheduleCarouselProps) {
  const [schedules, setSchedules] = useState<ScheduleNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      setIsLoading(true);
      const result = await getUpcomingSchedules(babyId, limit);
      if (result.success) {
        setSchedules(result.data);
      } else {
        console.error(result.error);
      }
      setIsLoading(false);
    };

    fetchSchedules();
  }, [babyId, limit]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="pb-1">
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-4 flex flex-col items-center justify-center text-center">
        <p className="text-sm text-gray-500 font-medium">등록된 다음 일정이 없습니다.</p>
        <p className="text-xs text-gray-400 mt-1 mb-3">예방접종, 영유아 검진일을 등록해 보세요.</p>
        <Link href={`/babies/${babyId}?tab=timeline`}>
          <Button variant="outline" size="sm">
            + 일정 추가하기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      {/* 헤더 - 간결하게 */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          📅 다음 일정
        </h3>
        <Link
          href={`/babies/${babyId}?tab=timeline`}
          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
        >
          전체
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* 캐러셀 - 항상 1개씩만 표시 */}
      {schedules.length === 1 ? (
        // 1개만 있을 때는 캐러셀 없이 바로 표시
        <div className="pb-1">
          <ScheduleCard schedule={schedules[0]} babyId={babyId} />
        </div>
      ) : (
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          className="compact-schedule-carousel"
        >
          {schedules.map((schedule, index) => (
            <SwiperSlide key={index}>
              <div className="pb-6">
                <ScheduleCard schedule={schedule} babyId={babyId} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* 커스텀 스타일 */}
      <style jsx global>{`
        .compact-schedule-carousel .swiper-pagination {
          bottom: 0 !important;
        }
        .compact-schedule-carousel .swiper-pagination-bullet {
          width: 5px;
          height: 5px;
          background: #cbd5e1;
          opacity: 1;
          margin: 0 3px !important;
        }
        .compact-schedule-carousel .swiper-pagination-bullet-active {
          background: #3b82f6;
        }
      `}</style>
    </div>
  );
}
