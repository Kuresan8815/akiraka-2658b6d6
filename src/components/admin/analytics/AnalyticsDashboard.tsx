import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { UserEngagementChart } from "./UserEngagementChart";
import { SustainabilityImpactChart } from "./SustainabilityImpactChart";
import { AnalyticsMetricCard } from "./AnalyticsMetricCard";

interface AnalyticsData {
  total_scans: number;
  unique_users: number;
  avg_scans_per_user: number;
  total_carbon_saved: number;
  total_water_saved: number;
  avg_sustainability_score: number;
}

export const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });

  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["analytics", dateRange],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return null;
      
      const { data, error } = await supabase.rpc('get_analytics_data', {
        start_date: dateRange.from.toISOString(),
        end_date: dateRange.to.toISOString()
      });
      
      if (error) throw error;
      return data[0]; // Get the first (and only) row from the result
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserEngagementChart dateRange={dateRange} />
            <SustainabilityImpactChart dateRange={dateRange} />
          </div>
        </>
      )}
    </div>
  );
};