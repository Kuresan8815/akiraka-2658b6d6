import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Widget } from "@/types/widgets";

type WidgetCategory = "environmental" | "social" | "governance";

export const useWidgetData = (businessId: string, category?: WidgetCategory) => {
  const { data: widgets, isLoading: widgetsLoading, error: widgetsError } = useQuery({
    queryKey: ["widgets", category],
    queryFn: async () => {
      let query = supabase
        .from("widgets")
        .select("*")
        .eq("is_active", true);
      
      if (category) {
        query = query.eq("category", category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Widget[];
    },
    staleTime: 30000,
    retry: 2,
  });

  const { data: businessWidgets, isLoading: businessWidgetsLoading, error: businessWidgetsError } = useQuery({
    queryKey: ["business-widgets", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_widgets")
        .select("widget_id")
        .eq("business_id", businessId)
        .eq("is_active", true);
      
      if (error) throw error;
      return data.map(bw => bw.widget_id);
    },
    staleTime: 30000,
    retry: 2,
  });

  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ["widget-metrics", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("widget_metrics")
        .select("*")
        .eq("business_id", businessId)
        .order("recorded_at", { ascending: false });
      
      if (error) throw error;
      
      const latestMetrics = new Map();
      data?.forEach(metric => {
        if (!latestMetrics.has(metric.widget_id)) {
          latestMetrics.set(metric.widget_id, metric.value);
        }
      });
      
      return latestMetrics;
    },
    enabled: !!businessId,
    staleTime: 30000,
    retry: 2,
  });

  const isLoading = widgetsLoading || businessWidgetsLoading || metricsLoading;
  const error = widgetsError || businessWidgetsError || metricsError;

  return {
    widgets,
    businessWidgets,
    metrics,
    isLoading,
    error
  };
};