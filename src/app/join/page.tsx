// src/app/join/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Users, Baby } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function JoinPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [inviteCode, setInviteCode] = useState(searchParams.get("code") || "");
  const [familyInfo, setFamilyInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [relation, setRelation] = useState("");

  // 로그인 확인
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/join${inviteCode ? `?code=${inviteCode}` : ""}`);
    }
  }, [status, router, inviteCode]);

  // 초대 코드 자동 조회
  useEffect(() => {
    if (inviteCode && session) {
      handleVerifyCode();
    }
  }, [session]);

  async function handleVerifyCode() {
    if (!inviteCode) {
      setError("초대 코드를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/families/invite?code=${inviteCode}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "초대 코드 확인에 실패했습니다.");
        setFamilyInfo(null);
      } else {
        setFamilyInfo(data);
      }
    } catch (err) {
      setError("초대 코드 확인 중 오류가 발생했습니다.");
      setFamilyInfo(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinFamily() {
    if (!relation) {
      setError("아기와의 관계를 선택해주세요.");
      return;
    }

    setJoining(true);
    setError("");

    try {
      const response = await fetch("/api/families/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteCode,
          role: "Member", // 기본 역할
          relation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "가족 참여에 실패했습니다.");
      } else {
        router.push(`/dashboard`);
      }
    } catch (err) {
      setError("가족 참여 중 오류가 발생했습니다.");
    } finally {
      setJoining(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4">
      <Card className="max-w-md w-full shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            가족 초대
          </CardTitle>
          <CardDescription>초대 코드로 가족에 참여하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <span>{error}</span>
              </AlertDescription>
            </Alert>
          )}

          {!familyInfo ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteCode">초대 코드</Label>
                <Input
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="text-center text-lg font-mono"
                  disabled={loading}
                />
              </div>

              <Button
                onClick={handleVerifyCode}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                disabled={loading || !inviteCode}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    확인 중...
                  </>
                ) : (
                  "초대 코드 확인"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg space-y-3">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  {familyInfo.familyName}
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    가족 구성원: {familyInfo.memberCount}명
                  </p>
                  <p className="flex items-center gap-2">
                    <Baby className="h-4 w-4" />
                    아기: {familyInfo.babyCount}명
                  </p>
                </div>
                {familyInfo.members && familyInfo.members.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <p className="text-xs text-gray-600 mb-2">현재 구성원:</p>
                    <div className="flex flex-wrap gap-2">
                      {familyInfo.members.map((member: any, index: number) => (
                        <span
                          key={index}
                          className="text-xs bg-white px-2 py-1 rounded-full border border-purple-200"
                        >
                          {member.name} ({member.relation})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="relation">아기와의 관계</Label>
                <Select value={relation} onValueChange={setRelation}>
                  <SelectTrigger>
                    <SelectValue placeholder="관계를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="엄마">엄마</SelectItem>
                    <SelectItem value="아빠">아빠</SelectItem>
                    <SelectItem value="할머니">할머니</SelectItem>
                    <SelectItem value="할아버지">할아버지</SelectItem>
                    <SelectItem value="이모">이모</SelectItem>
                    <SelectItem value="고모">고모</SelectItem>
                    <SelectItem value="삼촌">삼촌</SelectItem>
                    <SelectItem value="가족">가족</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setFamilyInfo(null)}
                  className="flex-1"
                  disabled={joining}
                >
                  취소
                </Button>
                <Button
                  onClick={handleJoinFamily}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  disabled={joining || !relation}
                >
                  {joining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      참여 중...
                    </>
                  ) : (
                    "가족 참여하기"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <JoinPageContent />
    </Suspense>
  );
}
