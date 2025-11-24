import DashboardHeader from '@/widgets/dashboard-header/DashboardHeader';

// This layout no longer needs to be async since it's not fetching session data.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authentication is now handled by middleware.ts
  // This layout simply provides the common structure for the dashboard.
  return (
    <div className="min-h-screen">
      <DashboardHeader />
      {children}
    </div>
  );
}
