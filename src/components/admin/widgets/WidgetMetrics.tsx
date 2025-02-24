
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BusinessWidget } from "@/types/widgets";
import { WidgetMetricsHeader } from "./components/WidgetMetricsHeader";
import { WidgetMetricsGrid } from "./components/WidgetMetricsGrid";

export const WidgetMetrics = ({ businessId }: { businessId: string }) => {
  const [metrics, setMetrics] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<'environmental' | 'social' | 'governance' | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: businessWidgets, refetch } = useQuery({
    queryKey: ["business-widgets", businessId, selectedCategory],
    queryFn: async () => {
      console.log("Fetching business widgets for:", { businessId, selectedCategory });
      
      const query = supabase
        .from("business_widgets")
        .select(`
          id,
          widget_id,
          position,
          is_active,
          widget:widgets(*)
        `)
        .eq("business_id", businessId);

      if (selectedCategory) {
        query.eq("widget.category", selectedCategory);
      }

      const { data, error } = await query.order("position");
      
      if (error) {
        console.error("Error fetching business widgets:", error);
        throw error;
      }

      console.log("Fetched business widgets:", data);
      return data as BusinessWidget[];
    },
    enabled: !!businessId,
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

      // Also clear any existing metric data for this widget
      await supabase
        .from("widget_metrics")
        .delete()
        .eq("business_id", businessId)
        .eq("widget_id", widgetId);

      refetch();
      queryClient.invalidateQueries({ queryKey: ["active-metrics"] });

      toast({
        title: "Success",
        description: "Widget removed and data cleared successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMetricChange = (widgetId: string, value: string) => {
    setMetrics((prev) => ({
      ...prev,
      [widgetId]: value,
    }));
  };

  return (
    <div className="space-y-4">
      <WidgetMetricsHeader
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <WidgetMetricsGrid
        businessWidgets={businessWidgets}
        metrics={metrics}
        onMetricChange={handleMetricChange}
        onUpdate={updateMetric}
        onRemove={removeWidget}
      />
    </div>
  );
};
