
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AlertCircle } from "lucide-react";

interface SustainabilityImpactChartProps {
  dateRange: DateRange | undefined;
}

export const SustainabilityImpactChart = ({ dateRange }: SustainabilityImpactChartProps) => {
  const { data: impactData, isLoading } = useQuery({
    queryKey: ["sustainability-impact", dateRange],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return null;

      const { data, error } = await supabase
        .from('sustainability_metrics')
        .select('*')
        .gte('recorded_at', dateRange.from.toISOString())
        .lte('recorded_at', dateRange.to.toISOString())
        .order('recorded_at');

      if (error) throw error;
      return data;
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-eco-primary">Sustainability Impact</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading impact data...</p>
            </div>
          ) : !impactData || impactData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500 font-medium">No sustainability data available</p>
              <p className="text-sm text-gray-400">Start tracking sustainability metrics to see your impact</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={impactData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="recorded_at"
                  tickFormatter={(value) => {
                    if (!value) return '';
                    return new Date(value).toLocaleDateString('en-US', { 
                      month: 'short',
                      year: 'numeric'
                    });
                  }}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(label) => {
                    if (!label) return '';
                    return new Date(label).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }}
                />
                <Legend />
                {impactData[0] && Object.keys(impactData[0])
                  .filter(key => !['id', 'recorded_at', 'created_at', 'updated_at', 'business_id'].includes(key))
                  .map((metric, index) => (
                    <Line
                      key={metric}
                      type="monotone"
                      dataKey={metric}
                      name={metric.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      stroke={`hsl(${index * 40}, 70%, 50%)`}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))
                }
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
