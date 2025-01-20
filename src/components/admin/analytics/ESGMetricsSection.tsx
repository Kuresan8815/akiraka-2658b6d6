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
      
      // First, fetch the business widgets
      const { data: businessWidgets, error: businessWidgetsError } = await supabase
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

      if (businessWidgetsError) {
        console.error("Error fetching business widgets:", businessWidgetsError);
        throw businessWidgetsError;
      }

      console.log("Raw business widgets data:", businessWidgets);

      if (!businessWidgets?.length) {
        console.log("No active widgets found for business");
        return [];
      }

      // Then fetch the latest metrics for these widgets
      const { data: metrics, error: metricsError } = await supabase
        .from("widget_metrics")
        .select("*")
        .eq("business_id", businessId)
        .in("widget_id", businessWidgets.map(bw => bw.widget.id))
        .order("recorded_at", { ascending: false });

      if (metricsError) {
        console.error("Error fetching widget metrics:", metricsError);
        throw metricsError;
      }

      console.log("Widget metrics data:", metrics);

      // Create a map of latest values for each widget
      const latestMetrics = new Map();
      metrics?.forEach(metric => {
        if (!latestMetrics.has(metric.widget_id)) {
          latestMetrics.set(metric.widget_id, metric.value);
        }
      });

      // Transform and validate the data
      const transformedWidgets = businessWidgets.map(bw => ({
        ...bw,
        latest_value: latestMetrics.get(bw.widget.id)
      }));

      // Filter out any null widgets or inactive widgets
      const filteredWidgets = transformedWidgets.filter(bw => {
        const isValid = bw.widget && bw.widget.is_active;
        if (!isValid) {
          console.log("Filtered out widget:", bw);
        }
        return isValid;
      });

      console.log("Final filtered and transformed widgets:", filteredWidgets);
      return filteredWidgets as BusinessWidget[];
    },
    enabled: !!businessId,
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  if (error) {
    console.error("Error in ESGMetricsSection:", error);
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