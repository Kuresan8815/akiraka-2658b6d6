import { DashboardWidgets } from "@/components/admin/dashboard/DashboardWidgets";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

interface ESGMetricsSectionProps {
  businessId: string;
}

export const ESGMetricsSection = ({ businessId }: ESGMetricsSectionProps) => {
  const { data: activeWidgets, isLoading, error } = useQuery({
    queryKey: ["business-widgets", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_widgets")
        .select(`
          id,
          widget_id,
          position,
          widget:widgets(*)
        `)
        .eq("business_id", businessId)
        .eq("is_active", true)
        .order("position");

      if (error) throw error;
      
      // Filter out any null widgets or inactive widgets
      return data?.filter(bw => bw.widget && bw.widget.is_active) || [];
    },
    staleTime: 1000, // Add stale time to prevent unnecessary refetches
    retry: 2, // Retry failed requests twice
  });

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold text-eco-primary mb-6">ESG Metrics</h2>
        <Card className="p-6 text-center text-red-500">
          <p>Error loading ESG metrics. Please try again later.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold text-eco-primary mb-6">ESG Metrics</h2>
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (!activeWidgets?.length) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold text-eco-primary mb-6">ESG Metrics</h2>
        <Card className="p-6 text-center">
          <p className="text-gray-500">No ESG metrics selected. Please add widgets from the Widgets page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-eco-primary mb-6">ESG Metrics</h2>
      <DashboardWidgets businessId={businessId} />
    </div>
  );
};