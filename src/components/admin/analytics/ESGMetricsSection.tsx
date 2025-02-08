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
      
      // Fetch only active business widgets with their associated widget data
      const { data: businessWidgets, error: businessWidgetsError } = await supabase
        .from("business_widgets")
        .select(`
          id,
          widget_id,
          position,
          is_active,
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
        .eq("is_active", true) // Only get active business widgets
        .order("position");

      if (businessWidgetsError) {
        console.error("Error fetching business widgets:", businessWidgetsError);
        throw businessWidgetsError;
      }

      console.log("Raw business widgets data:", businessWidgets);

      if (!businessWidgets?.length) {
        console.log("No widgets found for business");
        return [];
      }

      // Filter to ensure we only get widgets that are active themselves
      const activeBusinessWidgets = businessWidgets.filter(
        (bw) => bw.widget?.is_active
      );

      if (!activeBusinessWidgets.length) {
        console.log("No active widgets found");
        return [];
      }

      // Fetch the latest metrics for active widgets
      const { data: metrics, error: metricsError } = await supabase
        .from("widget_metrics")
        .select("*")
        .eq("business_id", businessId)
        .in(
          "widget_id",
          activeBusinessWidgets.map((bw) => bw.widget.id)
        )
        .order("recorded_at", { ascending: false });

      if (metricsError) {
        console.error("Error fetching widget metrics:", metricsError);
        throw metricsError;
      }

      console.log("Widget metrics data:", metrics);

      // Create a map of latest values for each widget
      const latestMetrics = new Map();
      metrics?.forEach((metric) => {
        if (!latestMetrics.has(metric.widget_id)) {
          latestMetrics.set(metric.widget_id, metric.value);
        }
      });

      // Transform the active widgets with their latest values
      const transformedWidgets = activeBusinessWidgets.map((bw) => ({
        id: bw.id,
        widget_id: bw.widget_id,
        position: bw.position,
        widget: bw.widget,
        latest_value: latestMetrics.get(bw.widget.id) ?? 0
      }));

      console.log("Final transformed widgets:", transformedWidgets);
      return transformedWidgets as BusinessWidget[];
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