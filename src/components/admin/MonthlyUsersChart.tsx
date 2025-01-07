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
      // Demo data for development
      return [
        { month: "Jan", users: 120 },
        { month: "Feb", users: 150 },
        { month: "Mar", users: 200 },
        { month: "Apr", users: 180 },
        { month: "May", users: 220 },
        { month: "Jun", users: 250 },
        { month: "Jul", users: 280 },
        { month: "Aug", users: 310 },
        { month: "Sep", users: 290 },
        { month: "Oct", users: 320 },
        { month: "Nov", users: 342 },
        { month: "Dec", users: 360 }
      ];
    },
  });

  return (
    <Card className="animate-fade-up">
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