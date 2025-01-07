import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { UserEngagementChart } from "./UserEngagementChart";
import { SustainabilityImpactChart } from "./SustainabilityImpactChart";
import { AnalyticsMetricCard } from "./AnalyticsMetricCard";
import { PreferredBrandsWidget } from "../PreferredBrandsWidget";

interface AnalyticsData {
  total_scans: number;
  unique_users: number;
  avg_scans_per_user: number;
  total_carbon_saved: number;
  total_water_saved: number;
  avg_sustainability_score: number;
  avg_purchase_per_user: number;
}

export const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });

  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["analytics", dateRange],
    queryFn: async () => {
      // Return dummy data for demonstration
      return {
        total_scans: 15742,
        unique_users: 3256,
        avg_scans_per_user: 4.8,
        total_carbon_saved: 25890,
        total_water_saved: 158900,
        avg_sustainability_score: 85.4,
        avg_purchase_per_user: 3000 // Updated to 3000 yen
      };
    },
  });

  const handleDownloadCSV = () => {
    if (!analyticsData) return;
    
    const csvContent = [
      ["Metric", "Value"],
      ["Total Scans", analyticsData.total_scans],
      ["Unique Users", analyticsData.unique_users],
      ["Average Scans per User", analyticsData.avg_scans_per_user],
      ["Total Carbon Saved (kg)", analyticsData.total_carbon_saved],
      ["Total Water Saved (L)", analyticsData.total_water_saved],
      ["Average Sustainability Score", analyticsData.avg_sustainability_score],
      ["Average Purchase per User (¥)", analyticsData.avg_purchase_per_user],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateRange?.from?.toISOString().split("T")[0]}-to-${
      dateRange?.to?.toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-eco-primary">Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          <Button
            onClick={handleDownloadCSV}
            disabled={!analyticsData}
            className="bg-eco-primary hover:bg-eco-secondary"
          >
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading analytics data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsMetricCard
              title="Total Scans"
              value={analyticsData?.total_scans?.toLocaleString() || "0"}
              description="Total product scans in selected period"
            />
            <AnalyticsMetricCard
              title="Unique Users"
              value={analyticsData?.unique_users?.toLocaleString() || "0"}
              description="Number of active users"
            />
            <AnalyticsMetricCard
              title="Avg. Scans per User"
              value={analyticsData?.avg_scans_per_user?.toLocaleString() || "0"}
              description="Average scans per user"
            />
            <AnalyticsMetricCard
              title="Avg. Purchase per User"
              value={`¥${analyticsData?.avg_purchase_per_user?.toLocaleString() || "0"}`}
              description="Average purchase amount per user"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserEngagementChart dateRange={dateRange} />
            <SustainabilityImpactChart dateRange={dateRange} />
          </div>

          <div className="mt-6">
            <PreferredBrandsWidget />
          </div>
        </>
      )}
    </div>
  );
};