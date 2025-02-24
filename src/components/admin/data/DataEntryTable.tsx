
import { BusinessWidget } from "@/types/widgets";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Save } from "lucide-react";

interface DataEntryTableProps {
  category: "environmental" | "social" | "governance";
  activeMetrics?: BusinessWidget[] | null;
  businessId?: string;
}

export const DataEntryTable = ({ category, activeMetrics, businessId }: DataEntryTableProps) => {
  const [metrics, setMetrics] = useState<Record<string, string>>({});
  const { toast } = useToast();

  if (!businessId) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-500">No business profile selected.</p>
      </div>
    );
  }

  if (!activeMetrics || activeMetrics.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-500">No active metrics found for {category} category.</p>
        <p className="text-sm text-gray-400 mt-2">Add metrics from the Widgets section to start tracking them.</p>
      </div>
    );
  }

  const handleMetricChange = (widgetId: string, value: string) => {
    setMetrics(prev => ({
      ...prev,
      [widgetId]: value
    }));
  };

  const handleSaveMetric = async (widgetId: string) => {
    try {
      if (!metrics[widgetId]) return;

      const { error } = await supabase
        .from("widget_metrics")
        .insert({
          business_id: businessId,
          widget_id: widgetId,
          value: parseFloat(metrics[widgetId])
        });

      if (error) throw error;

      // Clear the input after successful save
      setMetrics(prev => ({
        ...prev,
        [widgetId]: ""
      }));

      toast({
        title: "Success",
        description: "Metric value saved successfully",
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {activeMetrics.map((metric) => (
        <Card key={metric.id} className="p-4 flex flex-col">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{metric.widget?.name}</h3>
            <p className="text-sm text-gray-500">{metric.widget?.description}</p>
            <div className="text-xs text-gray-400">
              Unit: {metric.widget?.unit || 'N/A'}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Input
              type="number"
              placeholder={`Enter value${metric.widget?.unit ? ` (${metric.widget.unit})` : ''}`}
              value={metrics[metric.widget?.id] || ""}
              onChange={(e) => handleMetricChange(metric.widget?.id, e.target.value)}
            />
            <Button
              className="w-full"
              variant="secondary"
              onClick={() => handleSaveMetric(metric.widget?.id)}
              disabled={!metrics[metric.widget?.id]}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Value
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
