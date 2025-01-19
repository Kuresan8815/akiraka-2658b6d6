import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BusinessWidget } from "@/types/widgets";
import { WidgetMetricsHeader } from "./components/WidgetMetricsHeader";
import { WidgetMetricsGrid } from "./components/WidgetMetricsGrid";

export const WidgetMetrics = ({ businessId }: { businessId: string }) => {
  const [metrics, setMetrics] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<'environmental' | 'social' | 'governance' | null>(null);
  const { toast } = useToast();

  const { data: businessWidgets, refetch } = useQuery({
    queryKey: ["business-widgets", businessId, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("business_widgets")
        .select(`
          id,
          widget_id,
          position,
          widget:widgets(*)
        `)
        .eq("business_id", businessId)
        .eq("is_active", true);

      if (selectedCategory) {
        query = query.eq("widget.category", selectedCategory);
      }

      const { data, error } = await query.order("position");

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