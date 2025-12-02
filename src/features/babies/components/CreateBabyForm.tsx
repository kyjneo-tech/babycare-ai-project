// src/app/(dashboard)/components/CreateBabyForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createBaby } from '@/features/babies/actions';
import { getAllSchedulesForBaby } from '@/features/notes/actions';
import { FormField, FormInput, FormSelect } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SPACING, TYPOGRAPHY } from '@/design-system';
import { cn } from '@/lib/utils';
import { BabySchedulePreviewDialog } from './BabySchedulePreviewDialog';
import { GuestModeDialog } from '@/components/common/GuestModeDialog';
import { Note } from '@prisma/client';

export function CreateBabyForm() {
  const router = useRouter();
  const { status, update } = useSession();
  const isGuestMode = status === "unauthenticated";
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showGuestDialog, setShowGuestDialog] = useState(false);
  const [schedules, setSchedules] = useState<Note[]>([]);
  const [babyInfo, setBabyInfo] = useState<{ id: string; name: string; schedulesCount?: number } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isGuestMode) {
      setShowGuestDialog(true);
      return;
    }
    
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const input = {
      name: formData.get('name') as string,
      gender: formData.get('gender') as string,
      birthDate: new Date(formData.get('birthDate') as string),
      birthTime: formData.get('birthTime') as string,
    };

    // 간단한 클라이언트 측 유효성 검사
    if (!input.name || !input.gender || !input.birthDate || !input.birthTime) {
        setError('모든 필드를 올바르게 입력해주세요.');
        setLoading(false);
        return;
    }

    const result = await createBaby(input);

    if (result.success && result.data?.baby?.id) {
      // 성공 시 생성된 일정 조회
      const babyId = result.data.baby.id;
      const babyName = result.data.baby.name;
      const schedulesCount = result.data.schedulesCount;

      setBabyInfo({ id: babyId, name: babyName, schedulesCount });

      // 일정 조회 (1초 대기 - DB 커밋 시간 확보)
      await new Promise(resolve => setTimeout(resolve, 1000));
      const schedulesResult = await getAllSchedulesForBaby(babyId);

      if (schedulesResult.success && schedulesResult.data.schedules.length > 0) {
        setSchedules(schedulesResult.data.schedules);
        setShowScheduleDialog(true);
      } else {
        // 일정이 없으면 바로 아기 페이지로 이동
        router.push(`/babies/${babyId}`);
      }

      setLoading(false);
    } else {
      setError(result.error || '아기 등록에 실패했습니다.');
      setLoading(false);
    }
  }

  // Dialog가 닫히면 아기 페이지로 이동
  function handleDialogClose(open: boolean) {
    setShowScheduleDialog(open);
    if (!open) {
      // 다이얼로그가 닫히면 무조건 아기 페이지로 이동
      if (babyInfo?.id) {
        router.push(`/babies/${babyInfo.id}`);
      } else {
        // babyInfo가 없으면 홈으로
        router.push('/');
      }
    }
  }
  
  const formDisabled = loading || isGuestMode;

  return (
    <>
      {/* Force hydration fix */}
      <form onSubmit={handleSubmit} className={SPACING.space.lg}>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField label="아기 이름" htmlFor="name" required>
          <FormInput
            id="name"
            name="name"
            type="text"
            placeholder="예: 김철수"
            required
            disabled={formDisabled}
          />
        </FormField>

        <FormField label="성별" htmlFor="gender" required>
          <FormSelect
            id="gender"
            name="gender"
            required
            options={[
              { value: 'male', label: '남아' },
              { value: 'female', label: '여아' },
            ]}
            disabled={formDisabled}
          />
        </FormField>

        <div className={cn("grid grid-cols-2", SPACING.gap.md)}>
          <FormField label="생년월일" htmlFor="birthDate" required>
            <FormInput
              id="birthDate"
              name="birthDate"
              type="date"
              required
              disabled={formDisabled}
            />
          </FormField>

          <FormField label="태어난 시간" htmlFor="birthTime" required>
            <FormInput
              id="birthTime"
              name="birthTime"
              type="time"
              required
              disabled={formDisabled}
            />
          </FormField>
        </div>

        <Button
          type="submit"
          disabled={formDisabled}
          className="w-full"
          size="lg"
        >
          {loading ? '등록 중...' : '등록하기'}
        </Button>
      </form>

      {/* 일정 미리보기 Dialog */}
      {babyInfo && (
        <BabySchedulePreviewDialog
          open={showScheduleDialog}
          onOpenChange={handleDialogClose}
          schedules={schedules}
          babyName={babyInfo.name}
          totalCount={babyInfo.schedulesCount}
        />
      )}
      
      <GuestModeDialog open={showGuestDialog} onOpenChange={setShowGuestDialog} />
    </>
  );
}
