import { MonthlyUsersChart } from "../MonthlyUsersChart";
import { TopProductsWidget } from "../TopProductsWidget";

export const DashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <MonthlyUsersChart />
      <TopProductsWidget />
    </div>
  );
};