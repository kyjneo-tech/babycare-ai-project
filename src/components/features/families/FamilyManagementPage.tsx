"use client";

import { useState, useEffect } from "react";
import { getFamilyInfo, removeFamilyMember } from "@/features/families/actions";
import { InviteCodeCard } from "./InviteCodeCard";
import { FamilyMembersList } from "./FamilyMembersList";
import { JoinFamilyForm } from "./JoinFamilyForm";

export function FamilyManagementPage() {
  const [familyData, setFamilyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const handleJoinSuccess = () => {
    setShowJoinForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">가족 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900">👨‍👩‍👧‍👦 가족 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            가족원들을 관리하고 초대하세요.
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => setError("")}
              className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              닫기
            </button>
          </div>
        )}

        {!familyData ? (
          // 가족이 없는 경우
          <div className="text-center py-12">
            <div className="text-5xl mb-4">👥</div>
            <p className="text-gray-600 mb-6">아직 가족이 없습니다.</p>
            <button
              onClick={() => setShowJoinForm(!showJoinForm)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              {showJoinForm ? "취소" : "초대 코드로 가족 참여"}
            </button>
            {showJoinForm && (
              <div className="mt-6">
                <JoinFamilyForm onSuccess={handleJoinSuccess} />
              </div>
            )}
          </div>
        ) : (
          // 가족이 있는 경우
          <div className="space-y-6">
            {/* 초대 코드 카드 */}
            <InviteCodeCard
              familyName={familyData.name}
              inviteCode={familyData.inviteCode}
            />

            {/* 가족원 목록 */}
            <FamilyMembersList
              members={familyData.members}
              onRemoveMember={handleRemoveMember}
            />

            {/* 아기 목록 */}
            {familyData.babies && familyData.babies.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  👶 우리 아기들
                </h2>
                <div className="space-y-3">
                  {familyData.babies.map((baby: any) => (
                    <div
                      key={baby.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-2xl">
                        {baby.gender === "male" ? "👶‍♂️" : "👶‍♀️"}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {baby.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(baby.birthDate).toLocaleDateString("ko-KR")}{" "}
                          출생
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
