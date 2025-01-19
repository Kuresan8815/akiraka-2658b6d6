import React from 'react';
import { AnalyticsDashboard } from '@/components/admin/analytics/AnalyticsDashboard';
import { DashboardWidgets } from '@/components/admin/dashboard/DashboardWidgets';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const AdminAnalytics = () => {
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

  return (
    <div className="space-y-8 p-6">
      <AnalyticsDashboard />
      
      {currentBusiness?.id && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-eco-primary mb-6">ESG Metrics</h2>
          <DashboardWidgets businessId={currentBusiness.id} />
        </div>
      )}
    </div>
  );
};