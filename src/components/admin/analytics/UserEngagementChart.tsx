import { useQuery } from "@tanstack/react-query";
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
  Legend,
} from "recharts";

interface UserEngagementChartProps {
  dateRange: DateRange | undefined;
}

export const UserEngagementChart = ({ dateRange }: UserEngagementChartProps) => {
  const { data: engagementData, isLoading } = useQuery({
    queryKey: ["user-engagement", dateRange],
    queryFn: async () => {
      // Return dummy data showing projected growth
      return [
        { month: "Jan", currentYear: 1200, projectedGrowth: 1300 },
        { month: "Feb", currentYear: 1400, projectedGrowth: 1600 },
        { month: "Mar", currentYear: 1800, projectedGrowth: 2000 },
        { month: "Apr", currentYear: 2200, projectedGrowth: 2500 },
        { month: "May", currentYear: 2600, projectedGrowth: 3000 },
        { month: "Jun", currentYear: 3000, projectedGrowth: 3600 },
        { month: "Jul", currentYear: 3400, projectedGrowth: 4200 },
        { month: "Aug", currentYear: 3800, projectedGrowth: 4800 },
        { month: "Sep", currentYear: 4200, projectedGrowth: 5400 },
        { month: "Oct", currentYear: 4600, projectedGrowth: 6000 },
        { month: "Nov", currentYear: 5000, projectedGrowth: 6600 },
        { month: "Dec", currentYear: 5400, projectedGrowth: 7200 }
      ];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-eco-primary">User Engagement Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <p>Loading engagement data...</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="currentYear"
                  name="Current Year"
                  stroke="#2F5233"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="projectedGrowth"
                  name="Projected Growth"
                  stroke="#4F7942"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};