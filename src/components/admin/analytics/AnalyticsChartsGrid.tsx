import { DateRange } from "react-day-picker";
import { UserEngagementChart } from "./UserEngagementChart";
import { SustainabilityImpactChart } from "./SustainabilityImpactChart";
import { PreferredBrandsWidget } from "../PreferredBrandsWidget";

interface AnalyticsChartsGridProps {
  dateRange: DateRange | undefined;
}

export const AnalyticsChartsGrid = ({ dateRange }: AnalyticsChartsGridProps) => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserEngagementChart dateRange={dateRange} />
        <SustainabilityImpactChart dateRange={dateRange} />
      </div>
      <div className="mt-6">
        <PreferredBrandsWidget />
      </div>
    </>
  );
};