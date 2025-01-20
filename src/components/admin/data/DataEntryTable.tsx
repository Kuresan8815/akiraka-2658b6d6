import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MetricRowComponent } from "./MetricRow";
import { MetricCategory, MetricRow } from "@/types/metrics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

interface MetricHistoryRecord {
  id: string;
  value: number;
  recorded_at: string;
}

export const DataEntryTable = ({ category }: { category: MetricCategory }) => {
  const [selectedMetricId, setSelectedMetricId] = useState<string>("");
  const { toast } = useToast();

  // Fetch available metrics for the selected category
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

  // Fetch metric values and history when a metric is selected
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
      <Select value={selectedMetricId} onValueChange={setSelectedMetricId}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a metric" />
        </SelectTrigger>
        <SelectContent>
          {availableMetrics?.map((metric) => (
            <SelectItem key={metric.id} value={metric.id}>
              {metric.name} ({metric.unit || 'units'})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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

          {metricData.history.length > 0 && (
            <Card className="p-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Update History</h3>
              <div className="space-y-2">
                {metricData.history.map((record) => (
                  <div key={record.id} className="flex justify-between items-center text-sm">
                    <span>Value: {record.value} {metricData.current.unit}</span>
                    <span className="text-gray-500">
                      {new Date(record.recorded_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};