import { DashboardWidgets } from "@/components/admin/dashboard/DashboardWidgets";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BusinessWidget, Widget } from "@/types/widgets";
import { ESGMetricsLoading } from "./ESGMetricsLoading";
import { ESGMetricsEmpty } from "./ESGMetricsEmpty";
import { ESGMetricsError } from "./ESGMetricsError";

interface ESGMetricsSectionProps {
  businessId: string;
}

interface RawBusinessWidget {
  id: string;
  widget_id: string;
  position: number;
  widget: Widget;
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
      
      // Transform and validate the data
      const transformedWidgets = (data as RawBusinessWidget[])?.map(bw => ({
        ...bw,
        latest_value: undefined
      }));

      // Filter out any null widgets or inactive widgets
      const filteredWidgets = transformedWidgets?.filter(bw => {
        const isValid = bw.widget && bw.widget.is_active;
        if (!isValid) {
          console.log("Filtered out widget:", bw);
        }
        return isValid;
      }) || [];

      console.log("Filtered widgets:", filteredWidgets);
      return filteredWidgets as BusinessWidget[];
    },
    enabled: !!businessId,
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  if (error) {
    return <ESGMetricsError error={error as Error} />;
  }

  if (isLoading) {
    return <ESGMetricsLoading />;
  }

  if (!activeWidgets?.length) {
    return <ESGMetricsEmpty />;
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