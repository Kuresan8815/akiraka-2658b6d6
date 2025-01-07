import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminMetricCard } from "./AdminMetricCard";
import { RecentScansWidget } from "./RecentScansWidget";
import { TopProductsWidget } from "./TopProductsWidget";
import { MonthlyUsersChart } from "./MonthlyUsersChart";
import { Users, PackageSearch, Award, Activity } from "lucide-react";

export const AdminDashboard = () => {
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const { count: totalScans } = await supabase
        .from("scan_history")
        .select("*", { count: 'exact', head: true });

      const { data: totalPoints } = await supabase
        .from("rewards")
        .select("points_earned")
        .gt("points_earned", 0);

      const { data: activeUsers } = await supabase
        .from("monthly_scanning_activity")
        .select("user_id")
        .gte("month", new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString());

      return {
        totalScans: totalScans || 0,
        totalPoints: totalPoints?.reduce((acc, curr) => acc + curr.points_earned, 0) || 0,
        activeUsers: new Set(activeUsers?.map(u => u.user_id)).size || 0
      };
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading dashboard data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-eco-primary mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminMetricCard
          title="Total Scans"
          value={dashboardStats?.totalScans.toString() || "0"}
          icon={PackageSearch}
          description="Total products scanned by users"
        />
        <AdminMetricCard
          title="Sustainability Points"
          value={dashboardStats?.totalPoints.toString() || "0"}
          icon={Award}
          description="Total points earned by users"
        />
        <AdminMetricCard
          title="Active Users"
          value={dashboardStats?.activeUsers.toString() || "0"}
          icon={Users}
          description="Monthly active users"
        />
        <AdminMetricCard
          title="Recent Activity"
          value="View Details"
          icon={Activity}
          description="Click to see recent scans"
          onClick={() => {/* TODO: Implement navigation to detailed view */}}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyUsersChart />
        <TopProductsWidget />
      </div>

      <RecentScansWidget />
    </div>
  );
};