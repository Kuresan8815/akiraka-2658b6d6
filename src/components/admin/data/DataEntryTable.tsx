
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { MetricRowActions } from "./MetricRowActions";
import { BlockchainVerification } from "./BlockchainVerification";
import { MetricData, Widget } from "@/types/metric-entry";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export const DataEntryTable = ({ category }: { category: "environmental" | "social" | "governance" }) => {
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [metricValue, setMetricValue] = useState<string>("");
  const { toast } = useToast();

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

      return data
        .filter(bw => bw.widget?.category === category)
        .map(bw => bw.widget)
        .filter((widget): widget is Widget => widget !== null);
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

      const metricsMap = new Map<string, MetricData>();
      data.forEach(metric => {
        if (!metricsMap.has(metric.widget_id)) {
          metricsMap.set(metric.widget_id, {
            id: metric.id,
            value: metric.value,
            recorded_at: metric.recorded_at,
            tezos_operation_hash: metric.tezos_operation_hash,
            tezos_block_level: metric.tezos_block_level,
            tezos_contract_address: metric.tezos_contract_address
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

      const { data: metricData, error } = await supabase
        .from("widget_metrics")
        .insert({
          widget_id: widgetId,
          business_id: businessProfile?.business_id,
          value: value,
        })
        .select()
        .single();

      if (error) throw error;

      const { error: verificationError } = await supabase.functions.invoke('verify-tezos-metric', {
        body: {
          metricId: metricData.id,
          value: value,
          businessId: businessProfile?.business_id
        }
      });

      if (verificationError) throw verificationError;

      toast({
        title: "Success",
        description: "Metric value has been recorded and verified on Tezos blockchain",
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
                  <BlockchainVerification metric={currentMetric} />
                </TableCell>
                <TableCell>
                  <MetricRowActions
                    isEditing={isEditing}
                    onSave={() => handleSave(widget.id)}
                    onEdit={() => {
                      setEditingMetric(widget.id);
                      setMetricValue(currentMetric?.value?.toString() || "");
                    }}
                    onCancel={() => {
                      setEditingMetric(null);
                      setMetricValue("");
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
