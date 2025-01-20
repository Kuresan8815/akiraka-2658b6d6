import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { MetricRowComponent } from "./MetricRow";
import { MetricCategory, MetricRow } from "@/types/metrics";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { MetricSelector } from "./MetricSelector";
import { MetricHistory } from "./MetricHistory";

interface MetricHistoryRecord {
  id: string;
  value: number;
  recorded_at: string;
}

export const DataEntryTable = ({ category }: { category: MetricCategory }) => {
  const [selectedMetricId, setSelectedMetricId] = useState<string>("");
  const { toast } = useToast();

  const { data: availableMetrics } = useQuery({
    queryKey: ["available-metrics", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("widgets")
        .select("id, name, unit")
        .eq("category", category)
        .eq("is_active", true);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: metricData } = useQuery({
    queryKey: ["metric-values", selectedMetricId],
    queryFn: async () => {
      if (!selectedMetricId) return null;
      
      const { data, error } = await supabase
        .from("widget_metrics")
        .select("*")
        .eq("widget_id", selectedMetricId)
        .order("recorded_at", { ascending: false });
      
      if (error) throw error;
      
      const latestValue = data[0];
      if (!latestValue) return null;

      const metric = availableMetrics?.find(m => m.id === selectedMetricId);
      
      return {
        current: {
          id: latestValue.id,
          name: metric?.name || "",
          unit: metric?.unit || "units",
          value: Number(latestValue.value),
          lastUpdated: latestValue.recorded_at,
          isEditing: false
        } as MetricRow,
        history: data.slice(1).map(record => ({
          id: record.id,
          value: Number(record.value),
          recorded_at: record.recorded_at
        })) as MetricHistoryRecord[]
      };
    },
    enabled: !!selectedMetricId,
  });

  const handleEdit = (id: string) => {
    if (metricData?.current) {
      const updatedMetric = { ...metricData.current, isEditing: true };
      // Update local state
    }
  };

  const handleSave = async (id: string, value: string) => {
    try {
      const numericValue = Number(value);
      if (isNaN(numericValue)) {
        throw new Error("Invalid numeric value");
      }

      const { error } = await supabase
        .from("widget_metrics")
        .update({ value: numericValue })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Metric value updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update metric value",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("widget_metrics")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Metric value deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete metric value",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <MetricSelector
        availableMetrics={availableMetrics}
        selectedMetricId={selectedMetricId}
        onMetricSelect={setSelectedMetricId}
      />

      {metricData?.current && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Metric Name</th>
                  <th className="px-4 py-2 text-left">Unit of Measure</th>
                  <th className="px-4 py-2 text-left">Value</th>
                  <th className="px-4 py-2 text-left">Last Updated</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <MetricRowComponent
                  metric={metricData.current}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onCancel={() => {}}
                  onDelete={handleDelete}
                  onValueChange={() => {}}
                />
              </tbody>
            </table>
          </div>

          <MetricHistory 
            history={metricData.history} 
            unit={metricData.current.unit} 
          />
        </>
      )}
    </div>
  );
};