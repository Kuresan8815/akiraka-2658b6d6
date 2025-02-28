
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

interface UserEngagementChartProps {
  dateRange: DateRange | undefined;
}

export const UserEngagementChart = ({ dateRange }: UserEngagementChartProps) => {
  const startDate = dateRange?.from?.toISOString();
  const endDate = dateRange?.to?.toISOString();

  const { data: engagementData, isLoading } = useQuery({
    queryKey: ["user-engagement", startDate, endDate],
    queryFn: async () => {
      try {
        if (!startDate || !endDate) {
          return [];
        }
        
        const { data, error } = await supabase
          .from('monthly_scanning_activity')
          .select('*')
          .gte('month', startDate)
          .lte('month', endDate)
          .order('month');

        if (error) throw error;
        
        if (!data || data.length === 0) {
          // Return sample data if no real data exists
          return [
            { month: new Date().toISOString(), scan_count: 0, user_id: null }
          ];
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching user engagement data:", error);
        return [];
      }
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
            <div className="flex items-center justify-center h-full">
              <p>Loading engagement data...</p>
            </div>
          ) : !engagementData || engagementData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500 font-medium">No engagement data available</p>
              <p className="text-sm text-gray-400">Add products and start tracking user engagement</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month"
                  tickFormatter={(value) => {
                    if (!value) return '';
                    return new Date(value).toLocaleDateString('en-US', { month: 'short' });
                  }}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(label) => {
                    if (!label) return '';
                    return new Date(label).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    });
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="scan_count"
                  name="Scans"
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
