"use client";

import { useState } from "react";
import { updateMemberPermission } from "@/features/families/actions";

interface FamilyMember {
  userId: string;
  name: string;
  email: string;
  permission?: string;
  role: string;
  relation: string;
  joinedAt: Date;
}

interface FamilyMembersListProps {
  members: FamilyMember[];
  onRemoveMember: (memberId: string) => void;
  currentUserId?: string;
  currentUserPermission?: string;
}

const roleLabels: Record<string, string> = {
  parent: "부모",
  grandparent: "조부모",
  sitter: "돌봄이",
  other: "기타",
};

const relationLabels: Record<string, string> = {
  mother: "엄마",
  father: "아빠",
  grandmother: "할머니",
  grandfather: "할아버지",
  nanny: "돌봄이",
  other: "기타",
};

const permissionLabels: Record<string, string> = {
  owner: "소유자",
  admin: "관리자",
  member: "구성원",
  viewer: "조회 전용",
};

const permissionColors: Record<string, string> = {
  owner: "bg-purple-100 text-purple-800 border-purple-200",
  admin: "bg-blue-100 text-blue-800 border-blue-200",
  member: "bg-green-100 text-green-800 border-green-200",
  viewer: "bg-gray-100 text-gray-800 border-gray-200",
};

export function FamilyMembersList({
  members,
  onRemoveMember,
  currentUserId,
  currentUserPermission,
}: FamilyMembersListProps) {
  const [changingPermission, setChangingPermission] = useState<string | null>(null);

  const handlePermissionChange = async (
    memberId: string,
    newPermission: "admin" | "member" | "viewer"
  ) => {
    if (!confirm(`이 구성원의 권한을 "${permissionLabels[newPermission]}"(으)로 변경하시겠습니까?`)) {
      return;
    }

    setChangingPermission(memberId);
    try {
      const result = await updateMemberPermission(memberId, newPermission);
      if (result.success) {
        window.location.reload(); // 권한 변경 후 새로고침
      } else {
        alert(result.error || "권한 변경에 실패했습니다.");
      }
    } catch (error) {
      alert("권한 변경 중 오류가 발생했습니다.");
    } finally {
      setChangingPermission(null);
    }
  };

  const isOwner = currentUserPermission === "owner";
  const canManageMembers = currentUserPermission === "owner" || currentUserPermission === "admin";

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          👥 가족원 ({members.length}명)
        </h2>
      </div>

      <div className="space-y-3">
        {members.map((member) => {
          const isCurrentUser = member.userId === currentUserId;
          const memberPermission = member.permission || "member";

          return (
            <div
              key={member.userId}
              className={`flex items-start justify-between p-3 rounded-lg transition ${
                isCurrentUser
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1 flex-wrap gap-1">
                  <p className="font-semibold text-gray-900 truncate">
                    {member.name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-blue-600">(나)</span>
                    )}
                  </p>
                  {/* Permission Badge */}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      permissionColors[memberPermission] || permissionColors.member
                    } flex-shrink-0`}
                  >
                    {permissionLabels[memberPermission] || "구성원"}
                  </span>
                  {/* Role Badge */}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 flex-shrink-0">
                    {roleLabels[member.role] || member.role}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{member.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  역할: {relationLabels[member.relation] || member.relation}
                </p>

                {/* Permission Change Dropdown (Owner only, not for self or other owners) */}
                {isOwner && !isCurrentUser && memberPermission !== "owner" && (
                  <div className="mt-2">
                    <select
                      value={memberPermission}
                      onChange={(e) =>
                        handlePermissionChange(
                          member.userId,
                          e.target.value as "admin" | "member" | "viewer"
                        )
                      }
                      disabled={changingPermission === member.userId}
                      className="text-xs px-2 py-1 border border-gray-300 rounded bg-white text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="admin">관리자</option>
                      <option value="member">구성원</option>
                      <option value="viewer">조회 전용</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Remove Button (Admin or Owner, not for self or other owners) */}
              {canManageMembers &&
                !isCurrentUser &&
                memberPermission !== "owner" && (
                  <button
                    onClick={() => onRemoveMember(member.userId)}
                    className="flex-shrink-0 ml-2 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition"
                  >
                    제거
                  </button>
                )}
            </div>
          );
        })}
      </div>

      {members.length === 0 && (
        <p className="text-center text-gray-500 py-4">가족원이 없습니다.</p>
      )}
    </div>
  );
}
