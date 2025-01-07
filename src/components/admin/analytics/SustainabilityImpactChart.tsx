import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SustainabilityImpactChartProps {
  dateRange: DateRange | undefined;
}

export const SustainabilityImpactChart = ({ dateRange }: SustainabilityImpactChartProps) => {
  const { data: impactData, isLoading } = useQuery({
    queryKey: ["sustainability-impact", dateRange],
    queryFn: async () => {
      const { data: metrics, error } = await supabase
        .from("sustainability_impact_metrics")
        .select("*");

      if (error) throw error;
      return metrics;
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
            <p>Loading impact data...</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={impactData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_carbon_impact" fill="#2F5233" />
                <Bar dataKey="total_water_impact" fill="#4F7942" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};