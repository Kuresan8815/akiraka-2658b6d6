import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DashboardProgressProps {
  pointsEarned: number;
  pointsToNextMilestone: number;
}

export const DashboardProgress = ({ pointsEarned, pointsToNextMilestone }: DashboardProgressProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Milestone Progress</CardTitle>
    </CardHeader>
    <CardContent>
      <Progress value={(pointsEarned % 100)} className="h-2" />
      <p className="text-sm text-gray-500 mt-2">
        {pointsToNextMilestone} points away from your next milestone!
      </p>
    </CardContent>
  </Card>
);