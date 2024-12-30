import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardProgress } from "../DashboardProgress";

interface MilestoneWidgetProps {
  pointsEarned: number;
  pointsToNextMilestone: number;
}

export const MilestoneWidget = ({ 
  pointsEarned, 
  pointsToNextMilestone 
}: MilestoneWidgetProps) => (
  <Card className="h-full bg-gradient-to-br from-blue-50 to-white">
    <CardHeader>
      <CardTitle className="text-xl font-bold text-eco-primary">
        Milestone Progress
      </CardTitle>
    </CardHeader>
    <CardContent>
      <DashboardProgress 
        pointsEarned={pointsEarned} 
        pointsToNextMilestone={pointsToNextMilestone} 
      />
    </CardContent>
  </Card>
);