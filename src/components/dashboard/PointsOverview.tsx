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
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-eco-primary/10 to-eco-secondary/10 animate-pulse"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
        <CardTitle className="text-xl font-bold">Your Points</CardTitle>
        <Trophy className="h-6 w-6 text-eco-primary animate-bounce" />
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold text-eco-primary mb-4 animate-pulse">
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