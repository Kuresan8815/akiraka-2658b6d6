import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BusinessWidget } from "@/types/widgets";
import { MetricCard } from "./components/MetricCard";

export const WidgetMetrics = ({ businessId }: { businessId: string }) => {
  const [metrics, setMetrics] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const { data: businessWidgets, refetch } = useQuery({
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
      return data as BusinessWidget[];
    },
  });

  const updateMetric = async (widgetId: string) => {
    try {
      const value = metrics[widgetId];
      if (!value) return;

      const { error } = await supabase
        .from("widget_metrics")
        .insert({
          business_id: businessId,
          widget_id: widgetId,
          value: parseFloat(value),
        });

      if (error) throw error;

      setMetrics((prev) => ({
        ...prev,
        [widgetId]: "",
      }));

      toast({
        title: "Success",
        description: "Metric updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeWidget = async (widgetId: string) => {
    try {
      const { error } = await supabase
        .from("business_widgets")
        .update({ is_active: false })
        .eq("business_id", businessId)
        .eq("widget_id", widgetId);

      if (error) throw error;

      refetch();

      toast({
        title: "Success",
        description: "Widget removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Active Widgets</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {businessWidgets?.map((bw) => (
          <MetricCard
            key={bw.id}
            businessWidget={bw}
            metricValue={metrics[bw.widget.id] || ""}
            onMetricChange={(value) =>
              setMetrics((prev) => ({
                ...prev,
                [bw.widget.id]: value,
              }))
            }
            onUpdate={() => updateMetric(bw.widget.id)}
            onRemove={() => removeWidget(bw.widget.id)}
          />
        ))}
      </div>
    </div>
  );
};