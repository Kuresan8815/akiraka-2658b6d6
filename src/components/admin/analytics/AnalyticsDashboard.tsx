import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BusinessAnalytics } from "./BusinessAnalytics";
import { CustomerAnalytics } from "./CustomerAnalytics";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [analyticsType, setAnalyticsType] = useState<"business" | "customer">("business");

  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ["analytics", dateRange],
    queryFn: async () => {
      try {
        // Simulated API call - replace with actual API endpoint
        return {
          total_scans: 15742,
          unique_users: 3256,
          avg_scans_per_user: 4.8,
          total_carbon_saved: 25890,
          total_water_saved: 158900,
          avg_sustainability_score: 85.4,
          avg_purchase_per_user: 3000
        };
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        toast({
          title: "Error",
          description: "Failed to fetch analytics data. Please try again later.",
          variant: "destructive",
        });
        throw err;
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  const handleDownloadCSV = () => {
    if (!analyticsData) return;
    
    const csvContent = [
      ["Metric", "Value"],
      ...(analyticsType === "business" ? [
        ["Total Carbon Saved (kg)", analyticsData.total_carbon_saved],
        ["Total Water Saved (L)", analyticsData.total_water_saved],
        ["Average Sustainability Score", analyticsData.avg_sustainability_score],
      ] : [
        ["Total Scans", analyticsData.total_scans],
        ["Unique Users", analyticsData.unique_users],
        ["Average Scans per User", analyticsData.avg_scans_per_user],
        ["Average Purchase per User (¥)", analyticsData.avg_purchase_per_user],
      ])
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${analyticsType}-analytics-${dateRange?.from?.toISOString().split("T")[0]}-to-${
      dateRange?.to?.toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <p className="text-red-500">Failed to load analytics data</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-eco-primary">Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select
            value={analyticsType}
            onValueChange={(value: "business" | "customer") => setAnalyticsType(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select analytics type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="business">Business Analytics</SelectItem>
              <SelectItem value="customer">Customer Analytics</SelectItem>
            </SelectContent>
          </Select>
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
        <Card className="p-6">
          <div className="text-center">
            <p className="text-gray-500">Loading analytics data...</p>
          </div>
        </Card>
      ) : (
        analyticsType === "business" ? (
          <BusinessAnalytics dateRange={dateRange} />
        ) : (
          <CustomerAnalytics analyticsData={analyticsData} dateRange={dateRange} />
        )
      )}
    </div>
  );
};