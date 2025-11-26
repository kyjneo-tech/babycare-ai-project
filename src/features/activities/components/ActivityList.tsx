"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { Activity } from "@prisma/client";
import { deleteActivity, getActivitiesPaginated, bulkDeleteActivities } from "@/features/activities/actions";
import { ActivityCard } from "./ActivityCard";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useSelection } from "@/shared/hooks/useSelection";

interface DailySummary {
  sleepMinutes: number;
  feedingAmount: number;
  feedingCount: number;
}

export function ActivityList({
  babyId,
  activities: initialActivities,
  onActivityDeleted,
}: {
  babyId: string;
  activities: Activity[];
  onActivityDeleted: (id: string) => void;
}) {
  const [activities, setActivities] = useState(initialActivities.slice(0, 10));
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialActivities.length > 10);
  const [cursor, setCursor] = useState<string | null>(
    initialActivities.length > 10 ? initialActivities[9].id : null
  );
  
  // 일괄 선택 모드 상태
  const {
    selectedIds,
    isSelectionMode: selectionMode,
    toggleSelection,
    setSelectionMode,
    clearSelection,
  } = useSelection();

  const observerTarget = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // 오늘의 요약 계산
  const getDailySummary = (activities: Activity[]): DailySummary => {
    const todayActivities = activities.filter(a => isToday(new Date(a.startTime)));
    return todayActivities.reduce((acc, curr) => {
      if (curr.type === 'SLEEP' && curr.duration) {
        acc.sleepMinutes += curr.duration;
      } else if (curr.type === 'FEEDING') {
        acc.feedingCount += 1;
        if (curr.feedingAmount) {
          acc.feedingAmount += curr.feedingAmount;
        }
      }
      return acc;
    }, { sleepMinutes: 0, feedingAmount: 0, feedingCount: 0 });
  };

  const dailySummary = getDailySummary(activities);

  useEffect(() => {
    setActivities(initialActivities.slice(0, 10));
    setHasMore(initialActivities.length > 10);
    setCursor(initialActivities.length > 10 ? initialActivities[9].id : null);
  }, [initialActivities]);

  useEffect(() => {
    let channel: any;
    let isActive = true;

    const setupSubscription = async () => {
      try {
        channel = supabase
          .channel(`activities-${babyId}`, {
            config: { broadcast: { self: true } },
          })
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "Activity", filter: `babyId=eq.${babyId}` },
            (payload) => {
              if (isActive) {
                setActivities((prev) =>
                  prev.map((a) => a.id === payload.new.id ? (payload.new as Activity) : a)
                );
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "DELETE", schema: "public", table: "Activity", filter: `babyId=eq.${babyId}` },
            (payload) => {
              if (isActive) {
                setActivities((prev) => prev.filter((a) => a.id !== payload.old.id));
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "Activity", filter: `babyId=eq.${babyId}` },
            (payload) => {
              if (isActive) {
                setActivities((prev) => {
                  if (prev.some((a) => a.id === payload.new.id)) return prev;
                  return [payload.new as Activity, ...prev];
                });
              }
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") setIsSubscribed(true);
          });
      } catch (error) {
        console.error("Realtime 설정 오류:", error);
      }
    };

    setupSubscription();

    return () => {
      isActive = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [babyId, supabase]);

  const loadMoreActivities = useCallback(async () => {
    if (isLoading || !hasMore || !cursor) return;

    setIsLoading(true);
    try {
      const result = await getActivitiesPaginated(babyId, cursor, 10);
      if (result.success && result.data) {
        const newActivities = result.data.activities;
        setHasMore(result.data.hasMore);
        setActivities((prev) => [...prev, ...newActivities]);
        setCursor(result.data.nextCursor);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("활동 더 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [babyId, cursor, hasMore, isLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) loadMoreActivities();
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loadMoreActivities, hasMore]);

  const handleActivityUpdated = (updatedActivity: Activity) => {
    setActivities(prev => prev.map(a => a.id === updatedActivity.id ? updatedActivity : a));
  };



  const handleBulkDelete = async () => {
    if (!confirm(`${selectedIds.size}개 활동을 삭제하시겠습니까?`)) return;
    
    const result = await bulkDeleteActivities(Array.from(selectedIds));
    if (result.success) {
      setActivities(prev => prev.filter(a => !selectedIds.has(a.id)));
      setSelectionMode(false);
    } else {
      alert(result.error || "일괄 삭제 실패");
    }
  };

  const groupedActivities = activities.reduce((groups, activity) => {
    const date = format(new Date(activity.startTime), "yyyy-MM-dd");
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  const renderDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    let label = format(date, 'M월 d일 EEEE', { locale: ko });
    if (isToday(date)) label = "오늘";
    if (isYesterday(date)) label = "어제";

    return (
      <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur py-2 px-1 mb-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-600 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          {label}
        </h3>
      </div>
    );
  };

  return (
    <div className="space-y-[clamp(16px,5vw,24px)]">
      {/* 오늘의 요약 헤더 */}
      {activities.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-[clamp(12px,4vw,16px)] rounded-xl border border-blue-100 shadow-sm mb-[clamp(16px,5vw,24px)]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[clamp(10px,3vw,12px)] font-bold text-blue-800 uppercase tracking-wide">Today's Summary</h3>
            
            {/* 일괄 작업 컨트롤 */}
            <div className="flex gap-2">
              {selectionMode && selectedIds.size > 0 && (
                <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={handleBulkDelete}>
                  {selectedIds.size}개 삭제
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                className="h-7 text-xs bg-white/50 hover:bg-white"
                onClick={() => {
                  setSelectionMode(!selectionMode);
                }}
              >
                {selectionMode ? '취소' : '선택'}
              </Button>
            </div>
          </div>
          
          <div className="flex gap-[clamp(16px,5vw,24px)]">
            <div>
              <p className="text-[clamp(10px,3vw,12px)] text-blue-600 mb-0.5">총 수면</p>
              <p className="text-[clamp(16px,5vw,18px)] font-bold text-blue-900">
                {Math.floor(dailySummary.sleepMinutes / 60)}시간 {dailySummary.sleepMinutes % 60}분
              </p>
            </div>
            <div>
              <p className="text-[clamp(10px,3vw,12px)] text-blue-600 mb-0.5">총 수유량</p>
              <p className="text-[clamp(16px,5vw,18px)] font-bold text-blue-900">
                {dailySummary.feedingAmount}ml <span className="text-[clamp(12px,3.5vw,14px)] font-normal text-blue-700">({dailySummary.feedingCount}회)</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {!isSubscribed && (
        <div className="text-[clamp(10px,3vw,12px)] text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
          실시간 업데이트 연결 중...
        </div>
      )}

      {activities.length === 0 ? (
        <p className="text-gray-500 text-center py-[clamp(24px,8vw,32px)] text-[clamp(14px,4vw,16px)]">아직 기록된 활동이 없습니다.</p>
      ) : (
        <div className="relative pl-4 border-l-2 border-gray-100 ml-2 space-y-[clamp(16px,5vw,32px)]">
          {Object.entries(groupedActivities).map(([date, dayActivities]) => (
            <div key={date} className="relative">
              {renderDateHeader(date)}
              
              <div className="space-y-[clamp(12px,4vw,16px)]">
                {dayActivities.map((activity) => (
                  <div key={activity.id} className="relative group flex items-start gap-3">
                    {/* 타임라인 점 */}
                    {!selectionMode && (
                      <div className="absolute -left-[25px] top-[clamp(16px,5vw,24px)] w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)] rounded-full border-[clamp(2px,0.5vw,4px)] border-white bg-blue-400 shadow-sm z-10"></div>
                    )}
                    
                    {selectionMode && (
                      <div className="pt-4 pl-1">
                        <Checkbox
                          checked={selectedIds.has(activity.id)}
                          onCheckedChange={() => toggleSelection(activity.id)}
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <ActivityCard
                        activity={activity}
                        onDelete={!selectionMode ? onActivityDeleted : undefined}
                        onUpdate={!selectionMode ? handleActivityUpdated : undefined}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {hasMore && (
            <div ref={observerTarget} className="py-[clamp(8px,2vw,16px)] text-center">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-[clamp(16px,4vw,20px)] h-[clamp(16px,4vw,20px)] border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[clamp(12px,3.5vw,14px)] text-gray-600">로딩 중...</span>
                </div>
              ) : (
                <div className="text-gray-400 text-[clamp(12px,3.5vw,14px)]">스크롤하여 더 보기</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
