"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getFamilyInfo, removeFamilyMember, leaveFamily, deleteFamily } from "@/features/families/actions";
import { InviteCodeCard } from "./InviteCodeCard";
import { FamilyMembersList } from "./FamilyMembersList";
import { JoinFamilyForm } from "./JoinFamilyForm";
import { EditMyProfileCard } from "./EditMyProfileCard";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BabyCard } from "./BabyCard";
import { EditBabyDialog } from "./EditBabyDialog";
import { SPACING, TYPOGRAPHY } from "@/design-system";
import { cn } from "@/lib/utils";

export function FamilyManagementPage() {
  const router = useRouter();
  const [familyData, setFamilyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserPermission, setCurrentUserPermission] = useState<string | null>(null);
  const [currentUserRelation, setCurrentUserRelation] = useState<string | null>(null);
  const [editingBaby, setEditingBaby] = useState<any | null>(null);

  useEffect(() => {
    loadFamilyInfo();
  }, [refreshKey]);

  const loadFamilyInfo = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getFamilyInfo();
      if (result.success) {
        setFamilyData(result.data);
        
        // 현재 사용자 정보 저장
        if (result.data?.currentUser) {
          setCurrentUserId(result.data.currentUser.userId);
          setCurrentUserPermission(result.data.currentUser.permission);
        }
        
        // 현재 사용자의 relation 저장
        const currentMember = result.data?.members?.find(
          (m: any) => m.userId === result.data?.currentUser?.userId
        );
        if (currentMember) {
          setCurrentUserRelation(currentMember.relation);
        }
      } else {
        setError(result.error || "가족 정보를 불러올 수 없습니다.");
      }
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("이 가족원을 정말 제거하시겠습니까?")) return;

    try {
      const result = await removeFamilyMember(memberId);
      if (result.success) {
        setRefreshKey((prev) => prev + 1);
      } else {
        setError(result.error || "가족원 제거에 실패했습니다.");
      }
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    }
  };

  const handleLeaveFamily = async () => {
    if (!confirm("정말 가족을 나가시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

    try {
      const result = await leaveFamily();
      if (result.success) {
        window.location.href = "/";
      } else {
        setError(result.error || "가족 나가기에 실패했습니다.");
      }
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    }
  };

  const handleDeleteFamily = async () => {
    if (!confirm("정말 가족을 삭제하시겠습니까? 모든 데이터가 영구적으로 삭제됩니다.")) return;

    const doubleConfirm = window.prompt(
      '삭제하려면 "삭제"를 입력하세요.',
      ""
    );
    if (doubleConfirm !== "삭제") return;

    try {
      const result = await deleteFamily();
      if (result.success) {
        window.location.href = "/";
      } else {
        setError(result.error || "가족 삭제에 실패했습니다.");
      }
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    }
  };

  const handleJoinSuccess = () => {
    setShowJoinForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  const handleEditBaby = (babyId: string) => {
    const baby = familyData?.babies?.find((b: any) => b.id === babyId);
    if (baby) {
      setEditingBaby(baby);
    }
  };

  const handleDeleteBaby = async (babyId: string) => {
    if (!confirm("정말 이 아기를 삭제하시겠습니까? 모든 기록이 삭제됩니다.")) return;

    try {
      const { deleteBaby } = await import("@/features/babies/actions");
      const result = await deleteBaby(babyId);
      if (result.success) {
        // 로컬 상태 업데이트
        setRefreshKey((prev) => prev + 1);
        // 서버 컴포넌트 캐시 갱신 (AppHeader 드롭다운 즉시 반영)
        router.refresh();
      } else {
        setError(result.error || "아기 삭제에 실패했습니다.");
      }
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className={cn(TYPOGRAPHY.body.default, "text-muted-foreground")}>가족 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="👨‍👩‍👧‍👦 가족 관리"
        description="가족원들을 관리하고 초대하세요."
      />

      <Container size="md">
        <div className={SPACING.space.lg}>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
                <Button
                  variant="link"
                  onClick={() => setError("")}
                  className="ml-2 h-auto p-0 text-destructive"
                >
                  닫기
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {!familyData ? (
            // 가족이 없는 경우
            <Card>
              <CardContent className={cn("text-center", SPACING.card.large)}>
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">👥</div>
                <p className={cn(TYPOGRAPHY.body.default, "text-muted-foreground mb-4 sm:mb-6")}>
                  아직 가족이 없습니다.
                </p>
                <Button
                  onClick={() => setShowJoinForm(!showJoinForm)}
                  size="lg"
                >
                  {showJoinForm ? "취소" : "초대 코드로 가족 참여"}
                </Button>
                {showJoinForm && (
                  <div className="mt-4 sm:mt-6">
                    <JoinFamilyForm onSuccess={handleJoinSuccess} />
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            // 가족이 있는 경우
            <div className={SPACING.space.lg}>
              {/* 초대 코드 카드 */}
              <InviteCodeCard
                familyName={familyData.name}
                inviteCode={familyData.inviteCode}
                inviteCodeExpiry={familyData.inviteCodeExpiry}
                canRegenerate={currentUserPermission === "owner" || currentUserPermission === "admin"}
                onCodeRegenerated={() => setRefreshKey((prev) => prev + 1)}
              />

              {/* 가족원 목록 */}
              <FamilyMembersList
                members={familyData.members}
                onRemoveMember={handleRemoveMember}
                currentUserId={currentUserId || undefined}
                currentUserPermission={currentUserPermission || undefined}
              />

              {/* 내 프로필 편집 */}
              {currentUserRelation && (
                <EditMyProfileCard
                  currentRelation={currentUserRelation}
                  onSuccess={() => setRefreshKey((prev) => prev + 1)}
                />
              )}

              {/* 가족 나가기 / 삭제 버튼 */}
              <Card>
                <CardHeader>
                  <CardTitle className={TYPOGRAPHY.h3}>⚙️ 가족 관리</CardTitle>
                </CardHeader>
                <CardContent className={SPACING.space.sm}>
                  {/* 가족 나가기 */}
                  {currentUserPermission !== "owner" && (
                    <Button
                      onClick={handleLeaveFamily}
                      variant="secondary"
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                      size="lg"
                    >
                      가족 나가기
                    </Button>
                  )}

                  {/* 가족 삭제 (Owner만) */}
                  {currentUserPermission === "owner" && (
                    <div className={SPACING.space.xs}>
                      <Button
                        onClick={handleDeleteFamily}
                        variant="destructive"
                        className="w-full"
                        size="lg"
                      >
                        ⚠️ 가족 삭제
                      </Button>
                      <p className={cn(TYPOGRAPHY.caption, "text-destructive mt-1")}>
                        소유자만 가족을 삭제할 수 있습니다. 모든 데이터가 영구적으로 삭제됩니다.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 아기 목록 */}
              {familyData.babies && familyData.babies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className={TYPOGRAPHY.h3}>👶 우리 아기들</CardTitle>
                  </CardHeader>
                <CardContent className={SPACING.space.sm}>
                  {familyData.babies.map((baby: any) => (
                    <BabyCard
                      key={baby.id}
                      baby={baby}
                      canEdit={currentUserPermission === "owner" || currentUserPermission === "admin"}
                      onEdit={handleEditBaby}
                      onDelete={handleDeleteBaby}
                    />
                  ))}
                  {/* 아기 추가 버튼 */}
                    <Button asChild variant="outline" className="w-full mt-4">
                      <Link href="/add-baby">
                        <Plus className="mr-2 h-4 w-4" />
                        아기 추가하기
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </Container>

      {/* 아기 수정 다이얼로그 */}
      {editingBaby && (
        <EditBabyDialog
          baby={editingBaby}
          open={!!editingBaby}
          onOpenChange={(open) => !open && setEditingBaby(null)}
          onUpdate={() => {
            setEditingBaby(null);
            setRefreshKey((prev) => prev + 1);
          }}
        />
      )}
    </div>
  );
}
