import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface UserEngagementChartProps {
  dateRange: DateRange | undefined;
}

export const UserEngagementChart = ({ dateRange }: UserEngagementChartProps) => {
  const { data: engagementData, isLoading } = useQuery({
    queryKey: ["user-engagement", dateRange],
    queryFn: async () => {
      const { data: metrics, error } = await supabase
        .from("user_engagement_metrics")
        .select("*");

      if (error) throw error;
      return metrics;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-eco-primary">User Engagement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <p>Loading engagement data...</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total_interactions"
                  stroke="#2F5233"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};