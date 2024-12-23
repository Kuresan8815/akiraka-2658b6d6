import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Award, Droplets, Leaf, RefreshCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface DashboardMetrics {
  totalCarbonSaved: number;
  totalWaterSaved: number;
  scannedProducts: number;
  monthlyScans: { month: string; scans: number }[];
}

export const Dashboard = () => {
  const { data: metrics, refetch } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const { data: scanHistory } = await supabase
        .from("scan_history")
        .select(`
          product_id,
          products (
            carbon_footprint,
            water_usage
          )
        `)
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

      if (!scanHistory) return null;

      const totalCarbonSaved = scanHistory.reduce(
        (acc, scan) => acc + (scan.products?.carbon_footprint || 0),
        0
      );

      const totalWaterSaved = scanHistory.reduce(
        (acc, scan) => acc + (scan.products?.water_usage || 0),
        0
      );

      // Generate monthly scan data for the chart
      const monthlyScans = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          month: date.toLocaleString("default", { month: "short" }),
          scans: Math.floor(Math.random() * 10), // Mock data for demonstration
        };
      }).reverse();

      return {
        totalCarbonSaved,
        totalWaterSaved,
        scannedProducts: scanHistory.length,
        monthlyScans,
      };
    },
  });

  if (!metrics) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  const milestoneProgress = Math.min((metrics.scannedProducts / 10) * 100, 100);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-eco-primary">
          Your Sustainability Impact
        </h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          className="hover:text-eco-primary"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbon Saved</CardTitle>
            <Leaf className="h-4 w-4 text-eco-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCarbonSaved.toFixed(1)} kg</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Saved</CardTitle>
            <Droplets className="h-4 w-4 text-eco-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalWaterSaved.toLocaleString()} L</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Scanned</CardTitle>
            <Award className="h-4 w-4 text-eco-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.scannedProducts}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Milestone Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={milestoneProgress} className="h-2" />
            <p className="text-sm text-gray-500">
              {metrics.scannedProducts}/10 eco-friendly products scanned
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Scans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.monthlyScans}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p className="text-sm">{`${label}: ${payload[0].value} scans`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="scans"
                  fill="var(--eco-primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};