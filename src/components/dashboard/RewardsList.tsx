import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

interface Reward {
  name: string;
  pointsRequired: number;
  status: "Available" | "Locked";
}

interface RewardsListProps {
  rewards: Reward[];
  onRedeem: (reward: Reward) => void;
}

export const RewardsList = ({ rewards, onRedeem }: RewardsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Available Rewards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rewards.map((reward, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              reward.status === "Available"
                ? "border-eco-primary"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-3">
              <Gift
                className={`h-5 w-5 ${
                  reward.status === "Available"
                    ? "text-eco-primary"
                    : "text-gray-400"
                }`}
              />
              <div>
                <p className="font-medium">{reward.name}</p>
                <p className="text-sm text-gray-500">
                  {reward.pointsRequired} points required
                </p>
              </div>
            </div>
            <Button
              variant={reward.status === "Available" ? "default" : "secondary"}
              disabled={reward.status === "Locked"}
              onClick={() => onRedeem(reward)}
            >
              Redeem
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};