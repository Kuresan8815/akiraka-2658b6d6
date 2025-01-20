import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface EmissionsTrendChartProps {
  businessId: string;
}

interface EmissionsTrend {
  month: string;
  scope: string;
  total_emissions: number;
}

export const EmissionsTrendChart = ({ businessId }: EmissionsTrendChartProps) => {
  const { data: emissionsTrend, isLoading } = useQuery({
    queryKey: ["emissions-trend", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emissions_summary")
        .select("*")
        .eq("business_id", businessId)
        .order("month", { ascending: true });

      if (error) throw error;
      return data as EmissionsTrend[];
    },
  });

  const formatData = (data: EmissionsTrend[] | undefined) => {
    if (!data) return [];
    
    const monthlyData = data.reduce((acc: any[], curr) => {
      const monthKey = format(new Date(curr.month), "MMM yyyy");
      const existing = acc.find(item => item.month === monthKey);
      
      if (existing) {
        existing[curr.scope] = parseFloat(curr.total_emissions.toFixed(2));
      } else {
        acc.push({
          month: monthKey,
          [curr.scope]: parseFloat(curr.total_emissions.toFixed(2)),
        });
      }
      
      return acc;
    }, []);

    return monthlyData;
  };

  if (isLoading) {
    return <div>Loading emissions trend...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emissions Trend Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formatData(emissionsTrend)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: "kg CO₂e", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="scope_1" 
                name="Scope 1" 
                stroke="#2F855A" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="scope_2" 
                name="Scope 2" 
                stroke="#48BB78" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="scope_3" 
                name="Scope 3" 
                stroke="#68D391" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};