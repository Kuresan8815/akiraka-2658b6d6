import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

interface PointsOverviewProps {
  totalPoints: number;
  nextMilestonePoints: number;
}

export const PointsOverview = ({ totalPoints, nextMilestonePoints }: PointsOverviewProps) => {
  const progress = (totalPoints / nextMilestonePoints) * 100;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Your Points</CardTitle>
        <Trophy className="h-6 w-6 text-eco-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-eco-primary mb-4">
          {totalPoints} points
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-gray-500 mt-2">
          {nextMilestonePoints - totalPoints} points until next milestone
        </p>
      </CardContent>
    </Card>
  );
};