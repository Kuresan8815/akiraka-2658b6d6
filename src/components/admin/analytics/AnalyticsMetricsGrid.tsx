
import { AnalyticsMetricCard } from "./AnalyticsMetricCard";

interface AnalyticsData {
  total_scans: number;
  unique_users: number;
  avg_scans_per_user: number;
  avg_purchase_per_user?: number;
}

interface AnalyticsMetricsGridProps {
  analyticsData: AnalyticsData | undefined;
}

export const AnalyticsMetricsGrid = ({ analyticsData }: AnalyticsMetricsGridProps) => {
  return (
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
  );
};
