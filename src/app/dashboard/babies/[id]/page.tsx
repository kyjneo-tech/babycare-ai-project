export default function BabyDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Baby Detail Page for Baby ID: {params.id}</h1>
      {/* 여기에 실제 아기 상세 내용을 추가할 수 있습니다. */}
    </div>
  );
}