// src/app/(dashboard)/components/CreateBabyForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBaby } from '@/features/babies/actions';
import { FormField, FormInput, FormSelect } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SPACING, TYPOGRAPHY } from '@/design-system';
import { cn } from '@/lib/utils';

export function CreateBabyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
      // 성공 시 새로 생성된 아기의 대시보드로 이동
      router.push(`/babies/${result.data.baby.id}`);
    } else {
      setError(result.error || '아기 등록에 실패했습니다.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={SPACING.space.md}>
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
        />
      </FormField>

      <div className={cn("grid grid-cols-2", SPACING.gap.md)}>
        <FormField label="생년월일" htmlFor="birthDate" required>
          <FormInput
            id="birthDate"
            name="birthDate"
            type="date"
            required
          />
        </FormField>

        <FormField label="태어난 시간" htmlFor="birthTime" required>
          <FormInput
            id="birthTime"
            name="birthTime"
            type="time"
            required
          />
        </FormField>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? '등록 중...' : '등록하기'}
      </Button>
    </form>
  );
}
