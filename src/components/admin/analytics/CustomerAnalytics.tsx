import { DateRange } from "react-day-picker";
import { AnalyticsMetricsGrid } from "./AnalyticsMetricsGrid";
import { AnalyticsChartsGrid } from "./AnalyticsChartsGrid";

interface CustomerAnalyticsProps {
  analyticsData: {
    total_scans: number;
    unique_users: number;
    avg_scans_per_user: number;
    avg_purchase_per_user: number;
  } | undefined;
  dateRange: DateRange | undefined;
}

export const CustomerAnalytics = ({ analyticsData, dateRange }: CustomerAnalyticsProps) => {
  return (
    <div className="space-y-8">
      <AnalyticsMetricsGrid analyticsData={analyticsData} />
      <AnalyticsChartsGrid dateRange={dateRange} />
    </div>
  );
};