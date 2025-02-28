
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
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
  const startDate = dateRange?.from?.toISOString();
  const endDate = dateRange?.to?.toISOString();

  const { data: impactData, isLoading } = useQuery({
    queryKey: ["sustainability-impact", startDate, endDate],
    queryFn: async () => {
      try {
        if (!startDate || !endDate) {
          return [];
        }

        // Fetch sustainability metrics data
        const { data: metricsData, error: metricsError } = await supabase
          .from('sustainability_metrics')
          .select('*')
          .gte('recorded_at', startDate)
          .lte('recorded_at', endDate)
          .order('recorded_at');

        if (metricsError) throw metricsError;

        // If no data, return empty array
        if (!metricsData || metricsData.length === 0) {
          return [];
        }

        // Group by category 
        const grouped = metricsData.reduce((acc, metric) => {
          const category = metric.category;
          if (!acc[category]) {
            acc[category] = 0;
          }
          acc[category] += parseFloat(metric.value);
          return acc;
        }, {});

        // Transform to chart data format
        return Object.entries(grouped).map(([category, value]) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
          value
        }));
      } catch (error) {
        console.error("Error fetching sustainability impact data:", error);
        return [];
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-eco-primary">Sustainability Impact</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading impact data...</p>
            </div>
          ) : !impactData || impactData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500 font-medium">No impact data available</p>
              <p className="text-sm text-gray-400">Start tracking sustainability metrics to see data here</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={impactData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="value"
                  name="Impact Value"
                  fill="#4ade80"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
