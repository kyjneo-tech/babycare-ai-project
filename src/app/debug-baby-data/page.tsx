// 아기 데이터 비교 페이지
import { prisma } from "@/shared/lib/prisma";

export default async function DebugBabyDataPage() {
  // 김철수 (아빠의 아기)
  const kimChulsu = await prisma.baby.findUnique({
    where: { id: "cmib7smwi0002uewalfmrh0ya" },
    include: {
      Activities: {
        take: 10,
        orderBy: { createdAt: "desc" }
      },
      Measurements: {
        orderBy: { measuredAt: "desc" }
      },
      Notes: {
        take: 5,
        orderBy: { createdAt: "desc" }
      }
    }
  });

  // 꿍디 (엄마의 아기)
  const ggungdi = await prisma.baby.findUnique({
    where: { id: "cmifff5nr0001l40ae0s0n307" },
    include: {
      Activities: {
        take: 10,
        orderBy: { createdAt: "desc" }
      },
      Measurements: {
        orderBy: { measuredAt: "desc" }
      },
      Notes: {
        take: 5,
        orderBy: { createdAt: "desc" }
      }
    }
  });

  // 이영희 (아빠의 아기)
  const leeYoungHee = await prisma.baby.findUnique({
    where: { id: "cmie1p5yc0006uexr5102d20p" },
    include: {
      Activities: {
        take: 10,
        orderBy: { createdAt: "desc" }
      },
      Measurements: {
        orderBy: { measuredAt: "desc" }
      },
      Notes: {
        take: 5,
        orderBy: { createdAt: "desc" }
      }
    }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 아기별 데이터 비교</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 아빠의 김철수 */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <h2 className="text-xl font-bold mb-2">👶 김철수 (아빠의 가족)</h2>
          <p className="text-sm text-gray-600 mb-2">Baby ID: {kimChulsu?.id}</p>
          <p className="text-sm mb-2">생일: {kimChulsu?.birthDate.toLocaleDateString()}</p>

          <div className="mt-4">
            <h3 className="font-bold">📊 데이터 요약:</h3>
            <p>활동 기록: {kimChulsu?.Activities.length || 0}개</p>
            <p>체중/키 기록: {kimChulsu?.Measurements.length || 0}개</p>
            <p>노트: {kimChulsu?.Notes.length || 0}개</p>
          </div>

          {kimChulsu?.Activities && kimChulsu.Activities.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">최근 활동:</h3>
              <ul className="text-sm space-y-1">
                {kimChulsu.Activities.map((a) => (
                  <li key={a.id}>{a.type} - {a.createdAt.toLocaleString()}</li>
                ))}
              </ul>
            </div>
          )}

          {kimChulsu?.Measurements && kimChulsu.Measurements.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">체중/키 기록:</h3>
              <ul className="text-sm space-y-1">
                {kimChulsu.Measurements.map((m) => (
                  <li key={m.id}>
                    {m.weight}kg / {m.height}cm - {m.measuredAt.toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 엄마의 꿍디 */}
        <div className="border rounded-lg p-4 bg-pink-50">
          <h2 className="text-xl font-bold mb-2">👶 꿍디 (엄마의 가족)</h2>
          <p className="text-sm text-gray-600 mb-2">Baby ID: {ggungdi?.id}</p>
          <p className="text-sm mb-2">생일: {ggungdi?.birthDate.toLocaleDateString()}</p>

          <div className="mt-4">
            <h3 className="font-bold">📊 데이터 요약:</h3>
            <p>활동 기록: {ggungdi?.Activities.length || 0}개</p>
            <p>체중/키 기록: {ggungdi?.Measurements.length || 0}개</p>
            <p>노트: {ggungdi?.Notes.length || 0}개</p>
          </div>

          {ggungdi?.Activities && ggungdi.Activities.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">최근 활동:</h3>
              <ul className="text-sm space-y-1">
                {ggungdi.Activities.map((a) => (
                  <li key={a.id}>{a.type} - {a.createdAt.toLocaleString()}</li>
                ))}
              </ul>
            </div>
          )}

          {ggungdi?.Measurements && ggungdi.Measurements.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">체중/키 기록:</h3>
              <ul className="text-sm space-y-1">
                {ggungdi.Measurements.map((m) => (
                  <li key={m.id}>
                    {m.weight}kg / {m.height}cm - {m.measuredAt.toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 이영희 */}
        <div className="border rounded-lg p-4 bg-green-50 md:col-span-2">
          <h2 className="text-xl font-bold mb-2">👶 이영희 (아빠의 가족)</h2>
          <p className="text-sm text-gray-600 mb-2">Baby ID: {leeYoungHee?.id}</p>
          <p className="text-sm mb-2">생일: {leeYoungHee?.birthDate.toLocaleDateString()}</p>

          <div className="mt-4">
            <h3 className="font-bold">📊 데이터 요약:</h3>
            <p>활동 기록: {leeYoungHee?.Activities.length || 0}개</p>
            <p>체중/키 기록: {leeYoungHee?.Measurements.length || 0}개</p>
            <p>노트: {leeYoungHee?.Notes.length || 0}개</p>
          </div>

          {leeYoungHee?.Activities && leeYoungHee.Activities.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">최근 활동:</h3>
              <ul className="text-sm space-y-1">
                {leeYoungHee.Activities.map((a) => (
                  <li key={a.id}>{a.type} - {a.createdAt.toLocaleString()}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-bold mb-2">⚠️ 분석:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>김철수</strong>와 <strong>꿍디</strong>는 <strong>완전히 다른 아기</strong>입니다 (Baby ID가 다름)</li>
          <li>생일은 같지만, 각각 다른 가족에 속해 있습니다</li>
          <li>각 아기의 활동/체중 데이터도 <strong>별도로 관리</strong>됩니다</li>
          <li><strong>이영희</strong>는 아빠의 가족에만 있고, 엄마의 가족에는 없습니다</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-bold mb-2">💡 해결 방법:</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>엄마를 아빠의 가족에 초대</strong>
            <br />
            <span className="text-sm">아빠가 초대 코드 <code className="bg-white px-1">ZRHBIC</code>를 엄마에게 공유</span>
          </li>
          <li>
            <strong>엄마의 "꿍디의 가족" 데이터를 아빠의 가족으로 이동</strong> (선택)
            <br />
            <span className="text-sm text-red-600">⚠️ 주의: 데이터 마이그레이션 필요</span>
          </li>
          <li>
            <strong>또는 아빠를 엄마의 가족에 초대</strong>
            <br />
            <span className="text-sm">엄마의 초대 코드: <code className="bg-white px-1">A4T4ZP</code></span>
          </li>
        </ol>
      </div>
    </div>
  );
}
