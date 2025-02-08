import { AdminMetricCard } from "../AdminMetricCard";
import { PackageSearch, Award, Users, Activity } from "lucide-react";

interface DashboardMetricsProps {
  totalScans: number;
  totalPoints: number;
  activeUsers: number;
}

export const DashboardMetrics = ({ totalScans, totalPoints, activeUsers }: DashboardMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <AdminMetricCard
        title="Total Scans"
        value={totalScans.toLocaleString()}
        icon={PackageSearch}
        description="Total products scanned by users"
      />
      <AdminMetricCard
        title="Sustainability Points"
        value={totalPoints.toLocaleString()}
        icon={Award}
        description="Total points earned by users"
      />
      <AdminMetricCard
        title="Active Users"
        value={activeUsers.toLocaleString()}
        icon={Users}
        description="Monthly active users"
      />
      <AdminMetricCard
        title="Recent Activity"
        value="View Details"
        icon={Activity}
        description="Click to see recent scans"
        onClick={() => {/* TODO: Implement navigation to detailed view */}}
      />
    </div>
  );
};