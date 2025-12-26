"use client";

import { useState, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { regenerateInviteCode } from "@/features/families/actions";
import { Button } from "@/components/ui/button";
import { Share, Copy, RefreshCw, QrCode, MessageCircle } from "lucide-react";

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
      return { text: "만료됨", color: "text-red-400" };
    } else if (diffDays === 0) {
      return { text: "오늘 만료", color: "text-orange-400" };
    } else if (diffDays === 1) {
      return { text: "내일 만료", color: "text-orange-400" };
    } else if (diffDays <= 3) {
      return { text: `${diffDays}일 후 만료`, color: "text-yellow-400" };
    } else {
      return {
        text: `${expiryDate.getMonth() + 1}월 ${expiryDate.getDate()}일까지 유효`,
        color: "text-green-400"
      };
    }
  };

  const expiryInfo = formatExpiryDate(inviteCodeExpiry);

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-lg">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">가족 이름</p>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {familyName}
            </h2>
          </div>
          {expiryInfo && (
            <div className={`px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold ${expiryInfo.color}`}>
              {expiryInfo.text}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* 초대 링크 */}
        <div>
          <p className="text-sm font-medium text-slate-400 mb-2">초대 링크</p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-black/20 border border-white/5 rounded-xl px-4 py-3 overflow-hidden">
              <p className="text-xs sm:text-sm text-slate-300 break-all truncate">
                {inviteUrl}
              </p>
            </div>
            <Button
              onClick={handleCopyUrl}
              variant="secondary"
              size="icon"
              className="h-11 w-11 rounded-xl bg-white/10 hover:bg-white/20 border-0 text-white"
              title="링크 복사"
            >
              {copiedUrl ? (
                <span className="text-lg text-green-400">✓</span>
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* 초대 코드 */}
        <div>
          <p className="text-sm font-medium text-slate-400 mb-2">초대 코드</p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-black/20 border border-white/5 rounded-xl px-4 py-3">
              <p className="text-lg font-mono font-bold text-primary tracking-wider text-center">
                {inviteCode}
              </p>
            </div>
            <Button
              onClick={handleCopyCode}
              variant="secondary"
              size="icon"
              className="h-12 w-12 rounded-xl bg-white/10 hover:bg-white/20 border-0 text-white"
              title="코드 복사"
            >
              {copiedCode ? (
                <span className="text-lg text-green-400">✓</span>
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* 공유 버튼들 */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            onClick={handleShareSMS}
            className="bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30 h-12"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            문자 공유
          </Button>
          <Button
            onClick={handleShareWeb}
            className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 h-12"
          >
            <Share className="mr-2 h-4 w-4" />
            공유하기
          </Button>
          <Button
            onClick={() => setShowQR(!showQR)}
            className="col-span-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 h-12"
          >
            <QrCode className="mr-2 h-4 w-4" />
            {showQR ? "QR 코드 숨기기" : "QR 코드 보기"}
          </Button>
        </div>

        {/* QR 코드 */}
        {showQR && (
          <div className="bg-white p-6 rounded-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <p className="text-sm font-bold text-slate-900 mb-4">QR 코드를 스캔하여 참여하세요</p>
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
          <Button
            onClick={handleRegenerate}
            disabled={regenerating}
            variant="ghost"
            className="w-full text-slate-500 hover:text-orange-400 hover:bg-orange-500/10 h-12 mt-2"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
            {regenerating ? "재생성 중..." : "초대 코드 재생성"}
          </Button>
        )}

        <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
          💡 링크를 공유하면 클릭 한 번으로 가족에 참여할 수 있습니다.<br/>초대 코드는 7일 후 만료됩니다.
        </p>
      </div>
    </div>
  );
}
