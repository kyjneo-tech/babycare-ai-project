"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Shield,
  Mail,
  Info,
  Trash2,
  ExternalLink,
  ChevronRight,
  AlertTriangle
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("계정 삭제 실패");
      }

      // 로그아웃 후 로그인 페이지로 이동
      await signOut({ redirect: false });
      router.push("/login?deleted=true");
    } catch (error) {
      console.error("계정 삭제 오류:", error);
      alert("계정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-black text-foreground mb-2">설정</h1>
          <p className="text-muted-foreground">
            계정 정보 및 앱 설정을 관리합니다
          </p>
        </div>

        {/* 계정 정보 */}
        <Card>
          <CardHeader className="pt-6 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              계정 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 pb-6">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">이름</span>
              <span className="font-semibold">{session?.user?.name}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">이메일</span>
              <span className="font-semibold">{session?.user?.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* 법적 문서 */}
        <Card>
          <CardHeader className="pt-6 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              법적 고지
            </CardTitle>
            <CardDescription className="mt-2">
              서비스 이용약관 및 개인정보 처리방침을 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 pb-6">
            <Link href="/privacy-policy" target="_blank">
              <Button
                variant="ghost"
                className="w-full justify-between hover:bg-muted h-auto py-3 px-4"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>개인정보처리방침</span>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </Button>
            </Link>

            <Link href="/terms-of-service" target="_blank">
              <Button
                variant="ghost"
                className="w-full justify-between hover:bg-muted h-auto py-3 px-4"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>이용약관</span>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 고객 지원 */}
        <Card>
          <CardHeader className="pt-6 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              고객 지원
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 pb-6">
            <Link href="/about" target="_blank">
              <Button
                variant="ghost"
                className="w-full justify-between hover:bg-muted h-auto py-3 px-4"
              >
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-primary" />
                  <span>서비스 소개</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Button>
            </Link>

            <Link href="/contact" target="_blank">
              <Button
                variant="ghost"
                className="w-full justify-between hover:bg-muted h-auto py-3 px-4"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>문의하기</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 앱 정보 */}
        <Card>
          <CardHeader className="pt-6 pb-4">
            <CardTitle>앱 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 pb-6">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">버전</span>
              <span className="font-semibold">1.0.0</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">제작</span>
              <span className="font-semibold">BebeKnock Team</span>
            </div>
          </CardContent>
        </Card>

        {/* 회원 탈퇴 */}
        <Card className="border-destructive/50">
          <CardHeader className="pt-6 pb-4">
            <CardDescription className="text-destructive font-medium">
              ⚠️ 이 작업은 되돌릴 수 없습니다. 신중하게 진행해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-6">
            <Button
              variant="destructive"
              className="w-full h-auto py-3"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              회원 탈퇴
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 탈퇴 확인 다이얼로그 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              정말 탈퇴하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p className="font-semibold text-foreground">
                계정 탈퇴 시 다음 데이터가 영구적으로 삭제됩니다:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>계정 정보 및 설정</li>
                <li>가족 정보 (본인이 유일한 멤버인 경우)</li>
                <li>아기 정보 및 프로필</li>
                <li>모든 활동 기록 (수유, 수면, 기저귀 등)</li>
                <li>AI 채팅 기록</li>
                <li>메모 및 일정</li>
                <li>성장 발달 기록</li>
              </ul>
              <p className="text-destructive font-semibold pt-2">
                ⚠️ 이 작업은 되돌릴 수 없습니다!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "삭제 중..." : "탈퇴하기"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
