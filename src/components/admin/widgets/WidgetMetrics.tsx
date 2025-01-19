import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, Trash2, GripVertical } from "lucide-react";

interface Widget {
  id: string;
  name: string;
  description: string;
  metric_type: string;
  unit: string;
}

interface BusinessWidget {
  id: string;
  widget_id: string;
  position: number;
  widget: Widget;
  latest_value?: number;
}

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
          <Card key={bw.id} className="p-4">
            <div className="flex items-center mb-2">
              <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
              <h3 className="font-semibold">{bw.widget.name}</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">{bw.widget.description}</p>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={`Enter value (${bw.widget.unit})`}
                value={metrics[bw.widget.id] || ""}
                onChange={(e) =>
                  setMetrics((prev) => ({
                    ...prev,
                    [bw.widget.id]: e.target.value,
                  }))
                }
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => updateMetric(bw.widget.id)}
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="text-red-500 hover:text-red-600"
                onClick={() => removeWidget(bw.widget.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};