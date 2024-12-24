import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface RewardTierCardProps {
  points: number;
  reward: string;
  icon: LucideIcon;
  isUnlocked: boolean;
  onRedeem: () => void;
}

export const RewardTierCard = ({
  points,
  reward,
  icon: Icon,
  isUnlocked,
  onRedeem,
}: RewardTierCardProps) => (
  <Card className={!isUnlocked ? "opacity-60" : ""}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {points} Points
      </CardTitle>
      <Icon className={`h-4 w-4 ${isUnlocked ? "text-eco-primary" : "text-gray-400"}`} />
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-600 mb-4">{reward}</p>
      <Button
        onClick={onRedeem}
        disabled={!isUnlocked}
        className="w-full"
      >
        {isUnlocked ? "Redeem Points" : "Locked"}
      </Button>
    </CardContent>
  </Card>
);