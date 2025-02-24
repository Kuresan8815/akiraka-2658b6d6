
import { BusinessWidget } from "@/types/widgets";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Save, Link, AlertTriangle } from "lucide-react";
import { BlockchainVerification } from "./BlockchainVerification";

interface DataEntryTableProps {
  category: "environmental" | "social" | "governance";
  activeMetrics?: BusinessWidget[] | null;
  businessId?: string;
}

export const DataEntryTable = ({ category, activeMetrics, businessId }: DataEntryTableProps) => {
  const [metrics, setMetrics] = useState<Record<string, string>>({});
  const [savedMetrics, setSavedMetrics] = useState<Record<string, any>>({});
  const [latestValues, setLatestValues] = useState<Record<string, any>>({});
  const { toast } = useToast();

  // Fetch existing verified metrics
  useEffect(() => {
    const fetchVerifiedMetrics = async () => {
      if (!businessId || !activeMetrics) return;

      const widgetIds = activeMetrics.map(m => m.widget?.id).filter(Boolean);
      
      const { data, error } = await supabase
        .from("widget_metrics")
        .select('*')
        .eq('business_id', businessId)
        .in('widget_id', widgetIds)
        .not('tezos_operation_hash', 'is', null) // Correct syntax for checking non-null values
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error('Error fetching verified metrics:', error);
        return;
      }

      // Group by widget_id and get latest value for each
      const latest: Record<string, any> = {};
      data?.forEach(metric => {
        if (!latest[metric.widget_id] || metric.recorded_at > latest[metric.widget_id].recorded_at) {
          latest[metric.widget_id] = metric;
        }
      });

      setLatestValues(latest);
    };

    fetchVerifiedMetrics();
  }, [businessId, activeMetrics]);

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

      const { data: metricData, error } = await supabase
        .from("widget_metrics")
        .insert({
          business_id: businessId,
          widget_id: widgetId,
          value: parseFloat(metrics[widgetId])
        })
        .select()
        .single();

      if (error) throw error;

      // Save the metric data for blockchain verification
      setSavedMetrics(prev => ({
        ...prev,
        [widgetId]: metricData
      }));

      toast({
        title: "Data Saved",
        description: "Please verify this entry on the blockchain to make it visible in analytics.",
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
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            All metric entries must be verified on the blockchain before they appear in analytics.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeMetrics.map((metric) => (
          <Card key={metric.id} className="p-4 flex flex-col">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{metric.widget?.name}</h3>
              <p className="text-sm text-gray-500">{metric.widget?.description}</p>
              <div className="text-xs text-gray-400">
                Unit: {metric.widget?.unit || 'N/A'}
              </div>
              {latestValues[metric.widget?.id] && (
                <div className="text-sm text-green-600">
                  Last verified value: {latestValues[metric.widget?.id].value} {metric.widget?.unit}
                </div>
              )}
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
              {savedMetrics[metric.widget?.id] && (
                <div className="mt-2 border-t pt-2">
                  <BlockchainVerification metric={savedMetrics[metric.widget?.id]} />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
