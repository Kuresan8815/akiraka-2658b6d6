import { DashboardWidgets } from "@/components/admin/dashboard/DashboardWidgets";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BusinessWidget } from "@/types/widgets";

interface ESGMetricsSectionProps {
  businessId: string;
}

export const ESGMetricsSection = ({ businessId }: ESGMetricsSectionProps) => {
  const { data: activeWidgets, isLoading, error } = useQuery({
    queryKey: ["business-widgets", businessId],
    queryFn: async () => {
      console.log("Fetching widgets for business:", businessId);
      
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
            is_active,
            created_at,
            updated_at
          )
        `)
        .eq("business_id", businessId)
        .eq("is_active", true)
        .order("position");

      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }

      console.log("Raw widget data:", data);
      
      // Transform the data to match BusinessWidget type
      const transformedWidgets = data?.map(bw => ({
        id: bw.id,
        widget_id: bw.widget_id,
        position: bw.position,
        widget: bw.widget,
        latest_value: undefined // Add this to match BusinessWidget type
      })) || [];

      // Filter out any null widgets or inactive widgets
      const filteredWidgets = transformedWidgets.filter(bw => {
        const isValid = bw.widget && bw.widget.is_active;
        if (!isValid) {
          console.log("Filtered out widget:", bw);
        }
        return isValid;
      });

      console.log("Filtered widgets:", filteredWidgets);
      return filteredWidgets as BusinessWidget[];
    },
    enabled: !!businessId,
    staleTime: 1000 * 60, // Cache for 1 minute
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