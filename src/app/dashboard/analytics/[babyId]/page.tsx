import { redirect } from "next/navigation";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ babyId: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/dashboard/babies/${resolvedParams.babyId}?tab=analytics`);
}
