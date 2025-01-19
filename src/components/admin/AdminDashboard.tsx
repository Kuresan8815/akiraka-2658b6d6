import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminMetricCard } from "./AdminMetricCard";
import { RecentScansWidget } from "./RecentScansWidget";
import { TopProductsWidget } from "./TopProductsWidget";
import { MonthlyUsersChart } from "./MonthlyUsersChart";
import { Users, PackageSearch, Award, Activity } from "lucide-react";
import { WidgetGrid } from "./widgets/WidgetGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AdminDashboard = () => {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: currentBusiness } = useQuery({
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

  if (isLoading) {
    return <div className="p-6">Loading dashboard data...</div>;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-up">
      <h1 className="text-2xl font-bold text-eco-primary mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminMetricCard
          title="Total Scans"
          value={dashboardStats?.totalScans.toLocaleString() || "0"}
          icon={PackageSearch}
          description="Total products scanned by users"
        />
        <AdminMetricCard
          title="Sustainability Points"
          value={dashboardStats?.totalPoints.toLocaleString() || "0"}
          icon={Award}
          description="Total points earned by users"
        />
        <AdminMetricCard
          title="Active Users"
          value={dashboardStats?.activeUsers.toLocaleString() || "0"}
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

      {currentBusiness?.id ? (
        <div className="mt-8">
          <Tabs defaultValue="environmental" className="w-full">
            <TabsList>
              <TabsTrigger value="environmental">Environmental</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="governance">Governance</TabsTrigger>
            </TabsList>
            <TabsContent value="environmental">
              <WidgetGrid 
                businessId={currentBusiness.id} 
                category="environmental" 
              />
            </TabsContent>
            <TabsContent value="social">
              <WidgetGrid 
                businessId={currentBusiness.id} 
                category="social" 
              />
            </TabsContent>
            <TabsContent value="governance">
              <WidgetGrid 
                businessId={currentBusiness.id} 
                category="governance" 
              />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">Please select a business to view widgets</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyUsersChart />
        <TopProductsWidget />
      </div>

      <RecentScansWidget />
    </div>
  );
};