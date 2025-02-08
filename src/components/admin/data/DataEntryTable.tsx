
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { MetricRow } from "@/types/metrics";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface MetricData {
  id: string;
  value: number;
  recorded_at: string;
  blockchain_hash?: string;
  blockchain_tx_id?: string;
}

export const DataEntryTable = ({ category }: { category: "environmental" | "social" | "governance" }) => {
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [metricValue, setMetricValue] = useState<string>("");
  const { toast } = useToast();

  // First, get the current user's business profile
  const { data: businessProfile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("business_profiles")
        .select("business_id")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Then fetch only active widgets for this business
  const { data: activeWidgets, isLoading } = useQuery({
    queryKey: ["active-widgets", businessProfile?.business_id, category],
    enabled: !!businessProfile?.business_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_widgets")
        .select(`
          widget_id,
          widget:widgets(
            id,
            name,
            description,
            category,
            unit
          )
        `)
        .eq("business_id", businessProfile.business_id)
        .eq("is_active", true);

      if (error) throw error;

      // Filter widgets by category and ensure they're active
      return data
        .filter(bw => bw.widget?.category === category)
        .map(bw => bw.widget)
        .filter(widget => widget !== null);
    },
  });

  const { data: metrics, refetch: refetchMetrics } = useQuery({
    queryKey: ["metrics", businessProfile?.business_id, category],
    enabled: !!businessProfile?.business_id && !!activeWidgets?.length,
    queryFn: async () => {
      if (!activeWidgets?.length) return new Map<string, MetricData>();

      const { data, error } = await supabase
        .from("widget_metrics")
        .select("*")
        .eq("business_id", businessProfile.business_id)
        .in("widget_id", activeWidgets.map(w => w.id))
        .order("recorded_at", { ascending: false });

      if (error) throw error;

      // Create a map of latest values for each widget
      const metricsMap = new Map<string, MetricData>();
      data.forEach(metric => {
        if (!metricsMap.has(metric.widget_id)) {
          metricsMap.set(metric.widget_id, {
            id: metric.id,
            value: metric.value,
            recorded_at: metric.recorded_at,
            blockchain_hash: metric.blockchain_hash,
            blockchain_tx_id: metric.blockchain_tx_id
          });
        }
      });

      return metricsMap;
    },
  });

  const handleSave = async (widgetId: string) => {
    try {
      const value = parseFloat(metricValue);
      if (isNaN(value)) {
        throw new Error("Please enter a valid number");
      }

      const { error } = await supabase
        .from("widget_metrics")
        .insert({
          widget_id: widgetId,
          business_id: businessProfile?.business_id,
          value: value,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Metric value has been recorded and verified on blockchain",
      });

      setEditingMetric(null);
      setMetricValue("");
      refetchMetrics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!activeWidgets?.length) {
    return (
      <div className="text-center p-4 text-gray-500">
        No active metrics configured for this category
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metric Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Current Value</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Blockchain Verification</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeWidgets.map((widget) => {
            const currentMetric = metrics?.get(widget.id);
            const isEditing = editingMetric === widget.id;

            return (
              <TableRow key={widget.id}>
                <TableCell>{widget.name}</TableCell>
                <TableCell>{widget.description}</TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={metricValue}
                      onChange={(e) => setMetricValue(e.target.value)}
                      placeholder="Enter new value"
                      className="w-32"
                    />
                  ) : (
                    currentMetric?.value || "No data"
                  )}
                </TableCell>
                <TableCell>{widget.unit}</TableCell>
                <TableCell>
                  {currentMetric?.blockchain_hash ? (
                    <span className="text-xs text-gray-500">
                      Verified (TX: {currentMetric.blockchain_tx_id?.slice(0, 8)}...)
                    </span>
                  ) : (
                    "Not verified"
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave(widget.id)}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingMetric(null);
                          setMetricValue("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingMetric(widget.id);
                        setMetricValue(currentMetric?.value?.toString() || "");
                      }}
                    >
                      Update
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
