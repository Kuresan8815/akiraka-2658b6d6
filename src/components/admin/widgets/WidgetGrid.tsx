import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WidgetDisplay } from "./WidgetDisplay";
import { Widget } from "@/types/widgets";

interface WidgetGridProps {
  businessId: string;
  category?: 'environmental' | 'social' | 'governance';
}

export const WidgetGrid = ({ businessId, category }: WidgetGridProps) => {
  const { data: widgets, isLoading } = useQuery({
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
  });

  const { data: businessWidgets } = useQuery({
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
  });

  const { data: metrics } = useQuery({
    queryKey: ["widget-metrics", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("widget_metrics")
        .select("*")
        .eq("business_id", businessId)
        .order("recorded_at", { ascending: false });
      
      if (error) throw error;
      
      // Create a map of latest values for each widget
      const latestMetrics = new Map();
      data?.forEach(metric => {
        if (!latestMetrics.has(metric.widget_id)) {
          latestMetrics.set(metric.widget_id, metric.value);
        }
      });
      
      return latestMetrics;
    },
    enabled: !!businessId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  // Filter widgets to only show active ones that are associated with the business
  const activeWidgets = widgets?.filter(widget => 
    businessWidgets?.includes(widget.id)
  );

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