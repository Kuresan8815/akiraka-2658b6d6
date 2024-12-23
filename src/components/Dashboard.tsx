import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Award, Droplets, Leaf, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "./dashboard/MetricCard";
import { MilestoneProgress } from "./dashboard/MilestoneProgress";
import { MonthlyScansChart } from "./dashboard/MonthlyScansChart";

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
        <MetricCard
          title="Carbon Saved"
          value={`${metrics.totalCarbonSaved.toFixed(1)} kg`}
          icon={Leaf}
        />
        <MetricCard
          title="Water Saved"
          value={`${metrics.totalWaterSaved.toLocaleString()} L`}
          icon={Droplets}
        />
        <MetricCard
          title="Products Scanned"
          value={metrics.scannedProducts.toString()}
          icon={Award}
        />
      </div>

      <MilestoneProgress
        scannedProducts={metrics.scannedProducts}
        targetProducts={10}
      />

      <MonthlyScansChart data={metrics.monthlyScans} />
    </div>
  );
};