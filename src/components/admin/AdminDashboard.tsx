
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RecentScansWidget } from "./RecentScansWidget";
import { DashboardMetrics } from "./dashboard/DashboardMetrics";
import { DashboardCharts } from "./dashboard/DashboardCharts";
import { Building2 } from "lucide-react";

export const AdminDashboard = () => {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: currentBusiness, isLoading: isLoadingBusiness } = useQuery({
    queryKey: ["current-business", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const currentBusinessId = session?.user?.user_metadata?.current_business_id;
      
      if (!currentBusinessId) return null;

      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", currentBusinessId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      return {
        totalScans: 500,
        totalPoints: 10000,
        activeUsers: 200
      };
    },
  });

  if (isLoading || isLoadingBusiness) {
    return <div className="p-6">Loading dashboard data...</div>;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-up">
      {currentBusiness && (
        <div className="flex items-center gap-2 mb-4 bg-white p-4 rounded-lg shadow">
          <Building2 className="h-5 w-5 text-eco-primary" />
          <div>
            <h2 className="text-sm font-medium text-gray-500">Current Business</h2>
            <p className="text-lg font-semibold">{currentBusiness.name} ({currentBusiness.industry_type})</p>
          </div>
        </div>
      )}
      
      <h1 className="text-2xl font-bold text-eco-primary mb-6">Dashboard Overview</h1>
      
      <DashboardMetrics
        totalScans={dashboardStats?.totalScans || 0}
        totalPoints={dashboardStats?.totalPoints || 0}
        activeUsers={dashboardStats?.activeUsers || 0}
      />

      <DashboardCharts />
      <RecentScansWidget />
    </div>
  );
};
