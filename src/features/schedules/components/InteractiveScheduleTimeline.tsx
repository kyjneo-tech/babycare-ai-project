"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { Note, NoteType } from "@prisma/client";
import { getAllSchedulesForBaby, getInitialSchedulesWithToday } from "@/features/notes/actions";
import { getSampleSchedules } from "@/features/schedules/services/getSampleData";
import { Loader2, Plus, Search, CalendarDays, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleTimelineItem } from "./ScheduleTimelineItem";
import { ScheduleDetailModal } from "./ScheduleDetailModal";
import { CalendarView } from "./CalendarView";
import { GuestModeDialog } from "@/components/common/GuestModeDialog";
import { useInView } from "react-intersection-observer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InteractiveScheduleTimelineProps {
  babyId: string;
}

const STORAGE_KEY = 'schedule-view-preference';

export function InteractiveScheduleTimeline({ babyId }: InteractiveScheduleTimelineProps) {
  const { status } = useSession();
  const isGuestMode = status === 'unauthenticated' || babyId === 'guest-baby-id';

  const [schedules, setSchedules] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGuestDialog, setShowGuestDialog] = useState(false);

  // 뷰 전환 상태 (localStorage에서 초기값 로드)
  const [currentView, setCurrentView] = useState<'timeline' | 'calendar'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return (saved as 'timeline' | 'calendar') || 'timeline';
    }
    return 'timeline';
  });

  // 필터 & 검색 상태
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | NoteType>("all");
  const [periodFilter, setPeriodFilter] = useState<"all" | "week" | "month" | "3months">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Today 마커 ref & 자동 스크롤 상태
  const todayMarkerRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolledRef = useRef(false);

  // 무한 스크롤 상태
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const INITIAL_LIMIT = 50; // 초기 로드는 Today를 포함하도록 많이 가져옴
  const LIMIT = 20; // 추가 로드는 20개씩

  // Intersection Observer로 무한 스크롤 감지
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  // 초기 로드: 오늘 기준으로 과거 10개 + 미래 40개
  const fetchInitialSchedules = async (showLoading: boolean = true) => {
    if (isGuestMode) {
      setSchedules(getSampleSchedules());
      setHasMore(false);
      setIsLoading(false);
      return;
    }

    if (showLoading) setIsLoading(true);

    const result = await getInitialSchedulesWithToday(babyId);

    if (result.success) {
      setSchedules(result.data.schedules);
      setOffset(result.data.schedules.length);
      setHasMore(result.data.hasMoreFuture);

      // todayIndex는 서버에서 계산된 정확한 값
      // 자동 스크롤은 useEffect에서 처리
    } else {
      console.error(result.error);
    }

    if (showLoading) setIsLoading(false);
  };

  // 추가 로드: 무한 스크롤용
  const loadMoreSchedules = async () => {
    if (isGuestMode) return;

    setIsLoadingMore(true);

    const result = await getAllSchedulesForBaby(babyId, {
      offset: offset,
      limit: LIMIT
    });

    if (result.success) {
      // 중복 제거: 기존 ID와 겹치지 않는 항목만 추가
      setSchedules(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const newSchedules = result.data.schedules.filter(s => !existingIds.has(s.id));
        return [...prev, ...newSchedules];
      });
      setHasMore(result.data.hasMore);
      setOffset(offset + result.data.schedules.length);
    } else {
      console.error(result.error);
    }

    setIsLoadingMore(false);
  };
  
  // 초기 로드
  useEffect(() => {
    fetchInitialSchedules();

    // URL 파라미터 확인 (action=addSchedule)
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'addSchedule') {
      if (isGuestMode) {
        setShowGuestDialog(true);
      } else {
        setShowAddModal(true);
      }

      // URL 정리 (파라미터 제거)
      const newUrl = window.location.pathname + window.location.search.replace(/([&?])action=addSchedule/, '').replace(/\?$/, '');
      window.history.replaceState({}, '', newUrl);
    }
  }, [babyId, isGuestMode]);


  // Today 위치로 자동 스크롤 (컴포넌트 마운트 시 한 번만)
  useEffect(() => {
    if (!isLoading && schedules.length > 0 && !hasAutoScrolledRef.current) {
      const targetRef = todayMarkerRef.current || firstItemRef.current;
      if (targetRef) {
        targetRef.scrollIntoView({ behavior: 'auto', block: 'center' });
        hasAutoScrolledRef.current = true;
      }
    }
  }, [isLoading, schedules.length]);

  // 스크롤로 추가 로드
  useEffect(() => {
    if (inView && hasMore && !isLoadingMore && !isLoading) {
      loadMoreSchedules();
    }
  }, [inView, hasMore, isLoadingMore, isLoading]);

  const handleScheduleUpdated = (silent: boolean = false) => {
    fetchInitialSchedules(!silent);
  };
  
  const handleAddClick = () => {
    if (isGuestMode) {
      setShowGuestDialog(true);
    } else {
      setShowAddModal(true);
    }
  };

  const handleViewChange = (newView: 'timeline' | 'calendar') => {
    setCurrentView(newView);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newView);
    }
  };

  const handleDateClick = (date: Date) => {
    // 달력에서 날짜 클릭 시 타임라인으로 전환하고 해당 날짜로 스크롤
    setCurrentView('timeline');
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'timeline');
    }

    // 해당 날짜의 일정 찾기 (타임라인 전환 후 스크롤)
    setTimeout(() => {
      const dateSchedule = displaySchedules.find(s => {
        if (!s.dueDate) return false;
        const scheduleDate = new Date(s.dueDate);
        scheduleDate.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return scheduleDate.getTime() === date.getTime();
      });

      if (dateSchedule) {
        const element = document.getElementById(`schedule-${dateSchedule.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
  };

  const updateScheduleLocally = (scheduleId: string, updates: Partial<Note>) => {
    setSchedules(prev =>
      prev.map(s => s.id === scheduleId ? { ...s, ...updates } : s)
    );
  };

  // 필터링 & 검색 적용 (Hooks는 조건부 return 이전에 호출되어야 함)
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // 필터링된 일정 목록 (단일 리스트)
  const displaySchedules = useMemo(() => {
    let filtered = [...schedules];

    // 상태별 필터
    if (statusFilter === "pending") {
      filtered = filtered.filter(s => !s.completed);
    } else if (statusFilter === "completed") {
      filtered = filtered.filter(s => s.completed);
    }
    // "all"일 경우 모든 항목 표시 (완료 여부 상관없음)

    // 타입별 필터
    if (typeFilter !== "all") {
      filtered = filtered.filter(s => s.type === typeFilter);
    }

    // 기간별 필터
    if (periodFilter !== "all") {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const start3Months = new Date(now.setMonth(now.getMonth() - 3));

      filtered = filtered.filter(s => {
        if (!s.dueDate) return false;
        const dueDate = new Date(s.dueDate);

        switch (periodFilter) {
          case "week":
            return dueDate >= startOfWeek;
          case "month":
            return dueDate >= startOfMonth;
          case "3months":
            return dueDate >= start3Months;
          default:
            return true;
        }
      });
    }

    // 검색
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(query) ||
        (s.content && s.content.toLowerCase().includes(query))
      );
    }

    // 날짜순 정렬 (같은 날짜면 생성 시간 역순)
    return filtered.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      
      const dateCompare = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (dateCompare !== 0) return dateCompare;
      
      // 같은 날짜면 생성 시간 역순 (최근 생성된 것이 먼저)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [schedules, statusFilter, typeFilter, periodFilter, searchQuery]);

  // Today 마커 위치 찾기
  const todayIndex = useMemo(() => {
    return displaySchedules.findIndex(schedule => {
      if (!schedule.dueDate) return false;
      const scheduleDate = new Date(schedule.dueDate);
      scheduleDate.setHours(0, 0, 0, 0);
      return scheduleDate >= today;
    });
  }, [displaySchedules, today]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (schedules.length === 0 && !isGuestMode) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-4">생성된 일정이 없습니다.</p>
        <Button onClick={handleAddClick} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          첫 일정 추가하기
        </Button>

        {showAddModal && (
          <ScheduleDetailModal
            schedule={null}
            babyId={babyId}
            onClose={() => setShowAddModal(false)}
            onSuccess={handleScheduleUpdated}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Sticky 헤더: Tabs + 필터 & 검색 & 추가 버튼 */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 pb-4 mb-6 -mx-4 px-4 pt-2">
        <div className="space-y-3">
          {/* Tabs: 타임라인 ↔ 달력 전환 */}
          <Tabs value={currentView} onValueChange={(v) => handleViewChange(v as 'timeline' | 'calendar')}>
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                <span>타임라인</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>달력</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* 검색 (타임라인 뷰에만 표시) */}
          {currentView === 'timeline' && (
            <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="일정 제목이나 내용 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          )}

          {/* 필터 & 추가 버튼 */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 상태별 필터 */}
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="pending">예정</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
              </SelectContent>
            </Select>

            {/* 타입별 필터 */}
            <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="VACCINATION">예방접종</SelectItem>
                <SelectItem value="HEALTH_CHECKUP">건강검진</SelectItem>
                <SelectItem value="MILESTONE">발달 이정표</SelectItem>
                <SelectItem value="WONDER_WEEK">도약기</SelectItem>
                <SelectItem value="SLEEP_REGRESSION">수면퇴행</SelectItem>
                <SelectItem value="FEEDING_STAGE">이유식</SelectItem>
                <SelectItem value="APPOINTMENT">사용자 일정</SelectItem>
              </SelectContent>
            </Select>

            {/* 기간별 필터 */}
            <Select value={periodFilter} onValueChange={(v: any) => setPeriodFilter(v)}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="기간" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 기간</SelectItem>
                <SelectItem value="week">이번 주</SelectItem>
                <SelectItem value="month">이번 달</SelectItem>
                <SelectItem value="3months">3개월 내</SelectItem>
              </SelectContent>
            </Select>

            {/* 추가 버튼 (FloatingActionButton 대체) */}
            <Button onClick={handleAddClick} size="sm" className="ml-auto">
              <Plus className="h-4 w-4 mr-1" />
              새 일정
            </Button>
          </div>
        </div>
      </div>

      {/* 뷰 컨텐츠 */}
      {currentView === 'calendar' ? (
        <CalendarView 
          schedules={displaySchedules} 
          onDateClick={handleDateClick} 
        />
      ) : (
        /* 타임라인 뷰 */
        displaySchedules.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchQuery || statusFilter !== "all" || typeFilter !== "all"
              ? "검색 조건에 맞는 일정이 없습니다."
              : "생성된 일정이 없습니다."}
          </div>
        ) : (
          <div className="relative space-y-6">
            <div className="relative">
              {displaySchedules.map((schedule, index) => {
                const showTodayMarker = todayIndex === index;
                const isFirstItem = index === 0;

                return (
                  <div key={schedule.id} ref={isFirstItem ? firstItemRef : undefined}>
                    {/* Today 마커 */}
                    {showTodayMarker && (
                      <div ref={todayMarkerRef} className="flex items-center gap-2 my-4">
                        <div className="h-px bg-blue-500 flex-1"></div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          📍 오늘 (Today)
                        </span>
                        <div className="h-px bg-blue-500 flex-1"></div>
                      </div>
                    )}

                    {/* 일정 항목 */}
                    <ScheduleTimelineItem
                      schedule={schedule}
                      babyId={babyId}
                      onUpdate={handleScheduleUpdated}
                      onUpdateLocally={updateScheduleLocally}
                      isLast={index === displaySchedules.length - 1}
                    />
                  </div>
                );
              })}

              {/* 무한 스크롤 로더 */}
              {hasMore && (
                <div ref={loadMoreRef} className="flex justify-center py-4">
                  {isLoadingMore && (
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  )}
                </div>
              )}
            </div>

            {/* 끝 메시지 */}
            {!hasMore && displaySchedules.length > 0 && (
              <div className="text-center py-6 text-sm text-gray-500">
                모든 일정을 불러왔습니다
              </div>
            )}
          </div>
        )
      )}

      {/* 새 일정 추가 모달 */}
      {showAddModal && (
        <ScheduleDetailModal
          schedule={null}
          babyId={babyId}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleScheduleUpdated}
        />
      )}
      
      <GuestModeDialog open={showGuestDialog} onOpenChange={setShowGuestDialog} />
    </div>
  );
}
