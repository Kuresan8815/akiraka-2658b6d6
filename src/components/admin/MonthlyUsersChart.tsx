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
      return [
        { month: "Jan", users: 50 },
        { month: "Feb", users: 75 },
        { month: "Mar", users: 90 },
        { month: "Apr", users: 110 },
        { month: "May", users: 130 },
        { month: "Jun", users: 145 },
        { month: "Jul", users: 160 },
        { month: "Aug", users: 170 },
        { month: "Sep", users: 180 },
        { month: "Oct", users: 185 },
        { month: "Nov", users: 195 },
        { month: "Dec", users: 200 }
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