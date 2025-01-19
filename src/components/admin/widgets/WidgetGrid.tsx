import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WidgetDisplay } from "./WidgetDisplay";
import { Widget } from "@/types/widgets";
import { Skeleton } from "@/components/ui/skeleton";

interface WidgetGridProps {
  businessId: string;
  category?: 'environmental' | 'social' | 'governance';
}

export const WidgetGrid = ({ businessId, category }: WidgetGridProps) => {
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
    staleTime: 30000, // Cache data for 30 seconds
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
    staleTime: 30000, // Cache data for 30 seconds
    retry: 2,
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
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
    staleTime: 30000, // Cache data for 30 seconds
    retry: 2,
  });

  const isLoading = widgetsLoading || businessWidgetsLoading || metricsLoading;
  const error = widgetsError || businessWidgetsError;

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Error loading widgets. Please try again later.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32">
            <Skeleton className="h-full w-full" />
          </div>
        ))}
      </div>
    );
  }

  const activeWidgets = widgets?.filter(widget => 
    businessWidgets?.includes(widget.id)
  );

  if (!activeWidgets?.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No widgets available for this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {activeWidgets?.map((widget) => (
        <WidgetDisplay
          key={widget.id}
          widget={widget}
          value={metrics?.get(widget.id)}
        />
      ))}
    </div>
  );
};