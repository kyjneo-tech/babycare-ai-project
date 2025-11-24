// src/app/(dashboard)/components/CreateBabyForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBaby } from '@/features/babies/actions';

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

    if (result.success) {
      // 성공 시 페이지를 새로고침하여 아기 목록을 갱신합니다.
      router.refresh();
      // 폼 초기화 (선택 사항)
      (e.target as HTMLFormElement).reset();
    } else {
      setError(result.error || '아기 등록에 실패했습니다.');
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          아기 이름
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
          성별
        </label>
        <select
          id="gender"
          name="gender"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">선택하세요</option>
          <option value="male">남아</option>
          <option value="female">여아</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
            생년월일
          </label>
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="birthTime" className="block text-sm font-medium text-gray-700">
            태어난 시간
          </label>
          <input
            id="birthTime"
            name="birthTime"
            type="time"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '등록 중...' : '등록하기'}
      </button>
    </form>
  );
}
