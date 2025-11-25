"use client";

import { useState } from "react";

interface InviteCodeCardProps {
  familyName: string;
  inviteCode: string;
}

export function InviteCodeCard({
  familyName,
  inviteCode,
}: InviteCodeCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareSMS = () => {
    const message = `${familyName}에 초대합니다! 초대 코드: ${inviteCode}`;
    window.location.href = `sms:?&body=${encodeURIComponent(message)}`;
  };

  const handleShareWeb = async () => {
    const shareData = {
      title: `${familyName} 초대`,
      text: `${familyName}에 초대합니다! 초대 코드: ${inviteCode}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // 사용자가 공유 취소
      }
    } else {
      // Web Share API 미지원 시 복사
      handleCopy();
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 sm:p-6">
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-600 mb-1">가족 이름</p>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {familyName}
        </h2>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">초대 코드</p>
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2">
            <p className="text-sm sm:text-base font-mono text-gray-900 break-all">
              {inviteCode}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition flex items-center justify-center"
            title="복사"
          >
            {copied ? (
              <span className="text-lg">✓</span>
            ) : (
              <span className="text-lg">📋</span>
            )}
          </button>
        </div>

        {/* 공유 버튼들 */}
        <div className="flex gap-2">
          <button
            onClick={handleShareSMS}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <span>💬</span>
            <span>문자 공유</span>
          </button>
          <button
            onClick={handleShareWeb}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm py-2 px-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <span>📤</span>
            <span>공유하기</span>
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-600">
          이 코드를 다른 가족원과 공유하면 함께 아기 정보를 관리할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
