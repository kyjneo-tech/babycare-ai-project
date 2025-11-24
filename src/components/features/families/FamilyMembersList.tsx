"use client";

interface FamilyMember {
  userId: string;
  name: string;
  email: string;
  role: string;
  relation: string;
  joinedAt: Date;
}

interface FamilyMembersListProps {
  members: FamilyMember[];
  onRemoveMember: (memberId: string) => void;
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

export function FamilyMembersList({
  members,
  onRemoveMember,
}: FamilyMembersListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          👥 가족원 ({members.length}명)
        </h2>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.userId}
            className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="font-semibold text-gray-900 truncate">
                  {member.name}
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                  {roleLabels[member.role] || member.role}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{member.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                역할: {relationLabels[member.relation] || member.relation}
              </p>
            </div>

            <button
              onClick={() => onRemoveMember(member.userId)}
              className="flex-shrink-0 ml-2 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition"
            >
              제거
            </button>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <p className="text-center text-gray-500 py-4">가족원이 없습니다.</p>
      )}
    </div>
  );
}
