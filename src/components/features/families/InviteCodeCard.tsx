"use client";

import { useState, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { regenerateInviteCode } from "@/features/families/actions";

interface InviteCodeCardProps {
  familyName: string;
  inviteCode: string;
  inviteCodeExpiry?: Date | null;
  canRegenerate?: boolean;
  onCodeRegenerated?: () => void;
}

export function InviteCodeCard({
  familyName,
  inviteCode,
  inviteCodeExpiry,
  canRegenerate = false,
  onCodeRegenerated,
}: InviteCodeCardProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // 초대 URL 생성
  const inviteUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/join?code=${inviteCode}`;
    }
    return "";
  }, [inviteCode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleShareSMS = () => {
    const message = `${familyName}에 초대합니다! 🍼\n\n아래 링크를 클릭하여 참여하세요:\n${inviteUrl}\n\n또는 앱에서 초대 코드를 입력하세요: ${inviteCode}`;
    window.location.href = `sms:?&body=${encodeURIComponent(message)}`;
  };

  const handleShareWeb = async () => {
    const shareData = {
      title: `${familyName} 초대`,
      text: `${familyName}에 초대합니다! 🍼\n\n아래 링크를 클릭하여 참여하세요:`,
      url: inviteUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // 사용자가 공유 취소
      }
    } else {
      // Web Share API 미지원 시 URL 복사
      handleCopyUrl();
    }
  };

  const handleRegenerate = async () => {
    if (!confirm("초대 코드를 재생성하시겠습니까? 기존 코드는 사용할 수 없게 됩니다.")) {
      return;
    }

    setRegenerating(true);
    try {
      const result = await regenerateInviteCode();
      if (result.success) {
        alert("초대 코드가 재생성되었습니다!");
        onCodeRegenerated?.();
      } else {
        alert(result.error || "초대 코드 재생성에 실패했습니다.");
      }
    } catch (error) {
      alert("초대 코드 재생성 중 오류가 발생했습니다.");
    } finally {
      setRegenerating(false);
    }
  };

  // 만료 날짜 포맷팅
  const formatExpiryDate = (date: Date | null | undefined) => {
    if (!date) return null;
    const expiryDate = new Date(date);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: "만료됨", color: "text-red-600" };
    } else if (diffDays === 0) {
      return { text: "오늘 만료", color: "text-orange-600" };
    } else if (diffDays === 1) {
      return { text: "내일 만료", color: "text-orange-600" };
    } else if (diffDays <= 3) {
      return { text: `${diffDays}일 후 만료`, color: "text-yellow-600" };
    } else {
      return {
        text: `${expiryDate.getMonth() + 1}월 ${expiryDate.getDate()}일까지 유효`,
        color: "text-green-600"
      };
    }
  };

  const expiryInfo = formatExpiryDate(inviteCodeExpiry);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 sm:p-6">
      <div className="mb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">가족 이름</p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {familyName}
            </h2>
          </div>
          {expiryInfo && (
            <div className={`text-xs sm:text-sm font-semibold ${expiryInfo.color}`}>
              {expiryInfo.text}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* 초대 링크 */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">초대 링크</p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 overflow-hidden">
              <p className="text-xs sm:text-sm text-gray-900 break-all truncate">
                {inviteUrl}
              </p>
            </div>
            <button
              onClick={handleCopyUrl}
              className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition flex items-center justify-center"
              title="링크 복사"
            >
              {copiedUrl ? (
                <span className="text-lg">✓</span>
              ) : (
                <span className="text-lg">🔗</span>
              )}
            </button>
          </div>
        </div>

        {/* 초대 코드 */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">초대 코드</p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <p className="text-sm sm:text-base font-mono text-gray-900 break-all">
                {inviteCode}
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition flex items-center justify-center"
              title="코드 복사"
            >
              {copiedCode ? (
                <span className="text-lg">✓</span>
              ) : (
                <span className="text-lg">📋</span>
              )}
            </button>
          </div>
        </div>

        {/* 공유 버튼들 */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={handleShareSMS}
            className="bg-green-500 hover:bg-green-600 text-white text-sm py-2.5 px-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <span>💬</span>
            <span>문자 공유</span>
          </button>
          <button
            onClick={handleShareWeb}
            className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm py-2.5 px-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <span>📤</span>
            <span>공유하기</span>
          </button>
          <button
            onClick={() => setShowQR(!showQR)}
            className="col-span-2 bg-purple-500 hover:bg-purple-600 text-white text-sm py-2.5 px-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <span className="text-lg">📲</span>
            <span>{showQR ? "QR 코드 숨기기" : "QR 코드 보기"}</span>
          </button>
        </div>

        {/* QR 코드 */}
        {showQR && (
          <div className="bg-white p-4 rounded-lg border border-purple-200 flex flex-col items-center">
            <p className="text-sm font-medium text-gray-600 mb-3">QR 코드를 스캔하여 참여하세요</p>
            <QRCodeSVG
              value={inviteUrl}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
        )}

        {/* 초대 코드 재생성 버튼 */}
        {canRegenerate && (
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white text-sm py-2.5 px-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            <span>{regenerating ? "재생성 중..." : "초대 코드 재생성"}</span>
          </button>
        )}

        <p className="text-xs text-gray-600">
          💡 링크를 공유하면 클릭 한 번으로 가족에 참여할 수 있습니다. 초대 코드는 7일 후 만료됩니다.
        </p>
      </div>
    </div>
  );
}
