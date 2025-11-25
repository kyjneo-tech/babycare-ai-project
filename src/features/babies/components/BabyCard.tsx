"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteBaby } from "@/features/babies/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";
import { getNoteIcon, formatDueDate } from "@/shared/utils/note-helpers";
import { SPACING, TYPOGRAPHY } from "@/design-system";
import { cn } from "@/lib/utils";


interface Baby {
  id: string;
  name: string;
  birthDate: Date;
  gender: string;
  photoUrl?: string | null;
}

/**
 * 월령 계산 함수
 */
function calculateAge(birthDate: Date): string {
  const today = new Date();
  const birth = new Date(birthDate);
  
  const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
  const days = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
  
  if (months < 1) {
    return `생후 ${days}일`;
  } else if (months < 24) {
    const remainingDays = days - (months * 30);
    return `생후 ${months}개월 ${remainingDays}일`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years}세 ${remainingMonths}개월`;
  }
}

export function BabyCard({ baby }: { baby: Baby }) {
  const [deleting, setDeleting] = useState(false);
  const [upcomingSchedule, setUpcomingSchedule] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // 다가오는 일정 조회 (현재 월령 ±2주 범위, 1개만)
    const fetchUpcomingSchedule = async () => {
      try {
        const response = await fetch(`/api/notes/upcoming?babyId=${baby.id}&withinDays=14`);
        if (response.ok) {
          const data = await response.json();
          const schedules = data.notes || [];
          
          // VACCINATION, HEALTH_CHECKUP 우선
          const prioritySchedule = schedules.find(
            (note: any) => note.type === 'VACCINATION' || note.type === 'HEALTH_CHECKUP'
          );
          const firstSchedule = prioritySchedule || schedules[0];
          
          setUpcomingSchedule(firstSchedule);
        }
      } catch (error) {
        console.error('Failed to fetch upcoming schedule:', error);
      }
    };

    fetchUpcomingSchedule();
  }, [baby.id]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // 링크 이동 방지
    e.stopPropagation(); // 이벤트 버블링 방지

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

  const age = calculateAge(baby.birthDate);

  return (
    <Link href={`/babies/${baby.id}`} className="block">
      <Card className="overflow-hidden h-full transition-all hover:shadow-lg hover:-translate-y-1">
        <CardContent className={cn("p-6 relative", SPACING.space.md)}>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
            title="삭제"
          >
            {deleting ? <span className="animate-spin text-xs">...</span> : <Trash2 className="h-4 w-4" />}
          </Button>

          <div className={cn("flex items-center", SPACING.gap.md)}>
            <Avatar className="h-16 w-16">
              <AvatarImage src={baby.photoUrl || ''} alt={baby.name} />
              <AvatarFallback className={TYPOGRAPHY.h3}>
                {baby.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className={cn(TYPOGRAPHY.h3, "text-card-foreground truncate")}>
                {baby.name}
              </h3>
              <p className={cn(TYPOGRAPHY.caption, "mt-1")}>
                {age}
              </p>
            </div>
          </div>
          
          {upcomingSchedule && (
            <Badge variant="secondary" className="mt-4 text-xs font-normal w-full justify-start text-left">
              <span className="mr-2 flex-shrink-0">{getNoteIcon(upcomingSchedule.type)}</span>
              <div className="truncate">
                <span className="truncate font-semibold">{upcomingSchedule.title}</span>
                {upcomingSchedule.dueDate && (
                  <span className="ml-1.5 opacity-70">
                    ({formatDueDate(new Date(upcomingSchedule.dueDate))})
                  </span>
                )}
              </div>
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
