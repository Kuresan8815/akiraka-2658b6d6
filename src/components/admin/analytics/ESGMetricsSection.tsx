
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";

interface ESGMetricsSectionProps {
  businessId: string;
}

export const ESGMetricsSection = ({ businessId }: ESGMetricsSectionProps) => {
  const { data: esgMetrics, isLoading, error } = useQuery({
    queryKey: ["esg-metrics", businessId],
    queryFn: async () => {
      try {
        // Fetch ESG metrics data from sustainability metrics
        const { data, error } = await supabase
          .from('sustainability_metrics')
          .select('*')
          .eq('business_id', businessId)
          .order('recorded_at', { ascending: false })
          .limit(3);
          
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error("Error fetching ESG metrics:", error);
        return [];
      }
    }
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Loading ESG metrics data...</p>
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          Failed to load ESG metrics data
        </div>
      </Card>
    );
  }
  
  if (!esgMetrics || esgMetrics.length === 0) {
    return (
      <Card className="p-6">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500 font-medium">No ESG metrics available</p>
            <p className="text-sm text-gray-400">Start tracking sustainability metrics to see ESG data here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {esgMetrics.map((metric, index) => (
        <Card key={index} className="bg-white shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-eco-primary mb-2">{metric.metric_name}</h3>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800">{metric.value}</p>
                <p className="text-sm text-gray-500">{metric.unit}</p>
              </div>
              
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                Category: {metric.category}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
