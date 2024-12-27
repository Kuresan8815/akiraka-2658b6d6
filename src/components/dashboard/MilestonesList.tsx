import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock } from "lucide-react";

interface Milestone {
  name: string;
  points: number;
  status: "Locked" | "Unlocked";
}

interface MilestonesListProps {
  milestones: Milestone[];
}

export const MilestonesList = ({ milestones }: MilestonesListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Milestones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {milestones.map((milestone, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-background rounded-lg border"
          >
            <div className="flex items-center space-x-3">
              {milestone.status === "Unlocked" ? (
                <Unlock className="h-5 w-5 text-eco-primary" />
              ) : (
                <Lock className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium">{milestone.name}</p>
                <p className="text-sm text-gray-500">{milestone.points} points</p>
              </div>
            </div>
            <Badge
              variant={milestone.status === "Unlocked" ? "default" : "secondary"}
            >
              {milestone.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};