import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface EmissionsSummaryChartProps {
  businessId: string;
}

interface EmissionsSummary {
  scope: string;
  monthly_total: number;
  year_to_date: number;
}

export const EmissionsSummaryChart = ({ businessId }: EmissionsSummaryChartProps) => {
  const { data: emissionsSummary, isLoading } = useQuery({
    queryKey: ["emissions-summary", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_emissions_summary", { business_id_param: businessId });

      if (error) throw error;
      return data as EmissionsSummary[];
    },
  });

  const formatData = (data: EmissionsSummary[] | undefined) => {
    if (!data) return [];
    return data.map((item) => ({
      scope: item.scope.replace("scope_", "Scope "),
      monthly: parseFloat(item.monthly_total.toFixed(2)),
      ytd: parseFloat(item.year_to_date.toFixed(2)),
    }));
  };

  if (isLoading) {
    return <div>Loading emissions data...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carbon Emissions Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formatData(emissionsSummary)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="scope" />
              <YAxis label={{ value: "kg CO₂e", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Bar name="Monthly Total" dataKey="monthly" fill="#2F855A" />
              <Bar name="Year to Date" dataKey="ytd" fill="#48BB78" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};