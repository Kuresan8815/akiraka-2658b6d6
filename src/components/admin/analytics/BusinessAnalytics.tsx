
import { DateRange } from "react-day-picker";
import { Card } from "@/components/ui/card";
import { ESGMetricsSection } from "./ESGMetricsSection";
import { SustainabilityImpactChart } from "./SustainabilityImpactChart";
import { UserEngagementChart } from "./UserEngagementChart";

interface BusinessAnalyticsProps {
  analyticsData?: {
    total_carbon_saved: number;
    total_water_saved: number;
    avg_sustainability_score: number;
  };
  dateRange?: DateRange;
}

export const BusinessAnalytics = ({ analyticsData, dateRange }: BusinessAnalyticsProps) => {
  if (!analyticsData) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-gray-500">No analytics data available</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <ESGMetricsSection metrics={analyticsData} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserEngagementChart dateRange={dateRange} />
        <SustainabilityImpactChart dateRange={dateRange} />
      </div>
    </div>
  );
};
