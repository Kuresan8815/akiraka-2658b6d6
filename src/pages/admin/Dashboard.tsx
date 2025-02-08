
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SuperAdminDashboard } from '@/components/admin/SuperAdminDashboard';
import { BusinessProfileManager } from '@/components/business/BusinessProfileManager';
import { DashboardMetrics } from '@/components/admin/dashboard/DashboardMetrics';
import { DashboardCharts } from '@/components/admin/dashboard/DashboardCharts';
import { DashboardWidgets } from '@/components/admin/dashboard/DashboardWidgets';

export const AdminDashboard = () => {
  const { data: adminLevel } = useQuery({
    queryKey: ["admin-level"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("admin_users")
        .select("account_level")
        .eq("id", user.id)
        .single();

      return data?.account_level;
    },
  });

  const { data: businessId } = useQuery({
    queryKey: ["business-id"],
    enabled: adminLevel !== "super_admin",
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("business_users")
        .select("business_id")
        .eq("user_id", user.id)
        .single();

      return data?.business_id;
    },
  });

  const { data: widgets } = useQuery({
    queryKey: ["business-widgets", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data } = await supabase
        .from("business_widgets")
        .select("*, widget:widgets(*)")
        .eq("business_id", businessId);

      return data || [];
    },
  });

  const { data: metrics } = useQuery({
    queryKey: ["business-metrics", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data } = await supabase
        .from("business_metrics")
        .select("total_scans, total_points, active_users")
        .eq("business_id", businessId)
        .single();

      return data || { total_scans: 0, total_points: 0, active_users: 0 };
    },
  });

  if (adminLevel === "super_admin") {
    return <SuperAdminDashboard />;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <DashboardMetrics
        totalScans={metrics?.total_scans || 0}
        totalPoints={metrics?.total_points || 0}
        activeUsers={metrics?.active_users || 0}
      />
      <DashboardCharts />
      {businessId && widgets && (
        <DashboardWidgets 
          businessId={businessId} 
          activeWidgets={widgets}
        />
      )}
    </div>
  );
};
