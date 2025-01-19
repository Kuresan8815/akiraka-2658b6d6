import { DashboardWidgets } from "@/components/admin/dashboard/DashboardWidgets";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
          widget:widgets(
            id,
            name,
            description,
            category,
            metric_type,
            unit,
            is_active
          )
        `)
        .eq("business_id", businessId)
        .eq("is_active", true)
        .order("position");

      if (error) throw error;
      
      // Filter out any null widgets or inactive widgets
      return data?.filter(bw => bw.widget && bw.widget.is_active) || [];
    },
    staleTime: 1000,
    retry: 2,
  });

  if (error) {
    console.error("Error loading ESG metrics:", error);
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold text-eco-primary mb-6">ESG Metrics</h2>
        <Card className="p-6 text-center text-red-500">
          <p>Error loading ESG metrics: {error.message}</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold text-eco-primary mb-6">ESG Metrics</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-[200px]" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[200px]" />
              ))}
            </div>
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
      <DashboardWidgets 
        businessId={businessId} 
        activeWidgets={activeWidgets}
      />
    </div>
  );
};