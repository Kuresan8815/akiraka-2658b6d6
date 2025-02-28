
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
import { supabase } from "@/integrations/supabase/client";

// Define the data structure explicitly with all possible fields
interface AnalyticsData {
  total_scans: number;
  unique_users: number;
  avg_scans_per_user: number;
  total_carbon_saved: number;
  total_water_saved: number;
  avg_sustainability_score: number;
}

// Extended interface that includes optional fields
interface ExtendedAnalyticsData extends AnalyticsData {
  avg_purchase_per_user?: number;
}

interface CustomerData {
  total_scans: number;
  unique_users: number;
  avg_scans_per_user: number;
  avg_purchase_per_user?: number;
}

export const AnalyticsDashboard = () => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [analyticsType, setAnalyticsType] = useState<"business" | "customer">("business");

  // Convert date range to ISO strings for API
  const startDate = dateRange?.from?.toISOString();
  const endDate = dateRange?.to?.toISOString();

  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ["analytics", startDate, endDate],
    queryFn: async () => {
      try {
        if (!startDate || !endDate) {
          throw new Error("Date range is required");
        }

        // Using the get_analytics_data Supabase function
        const { data, error } = await supabase.rpc('get_analytics_data', {
          start_date: startDate,
          end_date: endDate
        });

        if (error) {
          console.error("Error fetching analytics data:", error);
          throw error;
        }

        // If no data returned, provide default empty values
        if (!data || data.length === 0) {
          const defaultData: ExtendedAnalyticsData = {
            total_scans: 0,
            unique_users: 0,
            avg_scans_per_user: 0,
            total_carbon_saved: 0,
            total_water_saved: 0, 
            avg_sustainability_score: 0,
            avg_purchase_per_user: 0
          };
          return defaultData;
        }

        // Extract the basic analytics data fields we know exist
        const baseData: AnalyticsData = {
          total_scans: data[0].total_scans,
          unique_users: data[0].unique_users,
          avg_scans_per_user: data[0].avg_scans_per_user,
          total_carbon_saved: data[0].total_carbon_saved,
          total_water_saved: data[0].total_water_saved,
          avg_sustainability_score: data[0].avg_sustainability_score
        };
        
        // Create the extended data with optional fields
        const extendedData: ExtendedAnalyticsData = {
          ...baseData
        };
        
        // Add avg_purchase_per_user only if it exists in the API response
        // Using a dynamic approach to check if the property exists
        if ('avg_purchase_per_user' in data[0]) {
          extendedData.avg_purchase_per_user = data[0].avg_purchase_per_user;
        }
        
        return extendedData;
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
        ["Average Purchase per User (¥)", (analyticsData as ExtendedAnalyticsData).avg_purchase_per_user || 0],
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

  // Create customer-specific data when needed
  const customerData: CustomerData | undefined = analyticsData ? {
    total_scans: analyticsData.total_scans,
    unique_users: analyticsData.unique_users,
    avg_scans_per_user: analyticsData.avg_scans_per_user,
    // Only include avg_purchase_per_user if it exists in the extended data
    ...((analyticsData as ExtendedAnalyticsData).avg_purchase_per_user !== undefined && { 
      avg_purchase_per_user: (analyticsData as ExtendedAnalyticsData).avg_purchase_per_user 
    })
  } : undefined;

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
          <BusinessAnalytics analyticsData={analyticsData} dateRange={dateRange} />
        ) : (
          <CustomerAnalytics analyticsData={customerData} dateRange={dateRange} />
        )
      )}
    </div>
  );
};
