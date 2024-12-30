import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DashboardProgressProps {
  pointsEarned: number;
  pointsToNextMilestone: number;
}

export const DashboardProgress = ({ pointsEarned, pointsToNextMilestone }: DashboardProgressProps) => (
  <Card className="bg-gradient-to-br from-white to-gray-50 shadow-[4px_4px_10px_rgba(0,0,0,0.1),-2px_-2px_10px_rgba(255,255,255,0.8)] border border-gray-100">
    <CardHeader className="bg-eco-secondary/40 rounded-t-lg">
      <CardTitle className="text-lg text-eco-primary">Milestone Progress</CardTitle>
    </CardHeader>
    <CardContent>
      <Progress value={(pointsEarned % 100)} className="h-2" />
      <p className="text-sm text-gray-500 mt-2">
        {pointsToNextMilestone} points away from your next milestone!
      </p>
    </CardContent>
  </Card>
);