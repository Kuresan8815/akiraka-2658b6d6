import { Card } from "@/components/ui/card";
import { DailyTip } from "./DailyTip";
import { StatsGrid } from "./StatsGrid";
import { DashboardProgress } from "./DashboardProgress";
import { Achievements } from "./Achievements";
import { MonthlyScansChart } from "./MonthlyScansChart";
import { MilestoneProgress } from "./MilestoneProgress";
import { QuickActions } from "./QuickActions";

interface DashboardGridProps {
  rewards: any;
  scanHistory: any[];
  achievements: any[];
  pointsToNextMilestone: number;
  totalCarbonSaved: number;
  totalWaterSaved: number;
}

export const DashboardGrid = ({
  rewards,
  scanHistory,
  achievements,
  pointsToNextMilestone,
  totalCarbonSaved,
  totalWaterSaved,
}: DashboardGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {/* Quick Actions - Full Width */}
      <div className="col-span-full">
        <Card className="p-4">
          <h2 className="text-xl font-bold text-eco-primary mb-4 uppercase">Quick Actions</h2>
          <QuickActions />
        </Card>
      </div>

      {/* Stats Grid - Full Width */}
      <div className="col-span-full">
        <Card className="p-4">
          <h2 className="text-xl font-bold text-eco-primary mb-4 uppercase">My Sustainability Impact</h2>
          <StatsGrid totalCarbonSaved={totalCarbonSaved} totalWaterSaved={totalWaterSaved} />
        </Card>
      </div>

      {/* Progress Widget */}
      <div className="col-span-1 md:col-span-1">
        <Card className="h-full">
          <DashboardProgress
            pointsEarned={rewards?.points_earned || 0}
            pointsToNextMilestone={pointsToNextMilestone}
          />
        </Card>
      </div>

      {/* Daily Tip Widget */}
      <div className="col-span-1 md:col-span-1">
        <DailyTip />
      </div>

      {/* Achievements Widget */}
      <div className="col-span-1 md:col-span-1">
        <Achievements achievements={achievements} />
      </div>

      {/* Monthly Activity Chart - Spans 2 Columns */}
      <div className="col-span-full md:col-span-2">
        <MonthlyScansChart
          data={[
            { month: "Jan", scans: 10 },
            { month: "Feb", scans: 15 },
            { month: "Mar", scans: 20 },
          ]}
        />
      </div>

      {/* Milestone Progress */}
      <div className="col-span-1">
        <MilestoneProgress
          scannedProducts={scanHistory?.length || 0}
          targetProducts={50}
        />
      </div>
    </div>
  );
};