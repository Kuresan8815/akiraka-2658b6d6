import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

export const MonthlyUsersChart = () => {
  const { data: monthlyUsers, isLoading } = useQuery({
    queryKey: ["monthly-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monthly_scanning_activity")
        .select("month, scan_count")
        .order("month", { ascending: true })
        .limit(12);

      if (error) throw error;

      return data.map((item) => ({
        month: format(new Date(item.month), "MMM"),
        users: item.scan_count,
      }));
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-eco-primary">Monthly Active Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <p>Loading chart data...</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyUsers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
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