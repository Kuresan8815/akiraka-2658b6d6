
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SuperAdminDashboard } from '@/components/admin/SuperAdminDashboard';
import { BusinessProfileManager } from '@/components/business/BusinessProfileManager';

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

  return adminLevel === "super_admin" ? <SuperAdminDashboard /> : <BusinessProfileManager />;
};
