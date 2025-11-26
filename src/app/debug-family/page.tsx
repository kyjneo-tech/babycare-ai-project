// 임시 디버깅 페이지 - 가족 데이터 확인용
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";
import { redirect } from "next/navigation";

export default async function DebugFamilyPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // 사용자의 모든 가족 멤버십 조회
  const allMemberships = await prisma.familyMember.findMany({
    where: { userId: session.user.id },
    include: {
      Family: {
        include: {
          Babies: true,
          FamilyMembers: {
            include: {
              User: {
                select: { name: true, email: true }
              }
            }
          }
        }
      }
    }
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔍 가족 데이터 디버깅</h1>

      <div className="mb-4 p-4 bg-blue-50 rounded">
        <p><strong>현재 사용자:</strong> {session.user.name} ({session.user.email})</p>
        <p><strong>사용자 ID:</strong> {session.user.id}</p>
        <p><strong>속한 가족 수:</strong> {allMemberships.length}개</p>
      </div>

      {allMemberships.map((membership, idx) => (
        <div key={membership.familyId} className="mb-6 p-4 border rounded">
          <h2 className="text-xl font-bold mb-2">
            가족 #{idx + 1}: {membership.Family.name}
          </h2>

          <div className="mb-3">
            <p><strong>가족 ID:</strong> {membership.Family.id}</p>
            <p><strong>초대 코드:</strong> {membership.Family.inviteCode}</p>
            <p><strong>내 역할:</strong> {membership.role} / {membership.relation}</p>
            <p><strong>내 권한:</strong> {membership.permission}</p>
          </div>

          <div className="mb-3">
            <h3 className="font-bold mb-1">👶 아기 목록 ({membership.Family.Babies.length}명):</h3>
            {membership.Family.Babies.length === 0 ? (
              <p className="text-gray-500">아기 없음</p>
            ) : (
              <ul className="list-disc pl-5">
                {membership.Family.Babies.map(baby => (
                  <li key={baby.id}>
                    {baby.name} ({baby.gender}) - 생일: {baby.birthDate.toLocaleDateString()}
                    <br />
                    <span className="text-sm text-gray-600">Baby ID: {baby.id}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="font-bold mb-1">👨‍👩‍👧‍👦 가족 구성원 ({membership.Family.FamilyMembers.length}명):</h3>
            <ul className="list-disc pl-5">
              {membership.Family.FamilyMembers.map(member => (
                <li key={member.userId}>
                  {member.User.name} ({member.User.email}) - {member.relation} [{member.permission}]
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {allMemberships.length === 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">⚠️ 가족이 없습니다!</p>
        </div>
      )}
    </div>
  );
}
