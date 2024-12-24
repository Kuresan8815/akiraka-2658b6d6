import { useQuery } from "@tanstack/react-query";
import { Award, Gift, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { MetricCard } from "./MetricCard";
import { RewardTierCard } from "./RewardTierCard";

const REWARD_TIERS = [
  { points: 100, reward: "10% off your next purchase", icon: Star },
  { points: 250, reward: "25% off your next purchase", icon: Award },
  { points: 500, reward: "50% off your next purchase", icon: Gift },
];

export const RewardsDashboard = () => {
  const { toast } = useToast();

  const { data: rewards, isLoading } = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleRedeemPoints = async (points: number, reward: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to redeem points",
        variant: "destructive",
      });
      return;
    }

    if (!rewards || rewards.points_earned - rewards.points_redeemed < points) {
      toast({
        title: "Error",
        description: "Not enough points to redeem this reward",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("rewards")
      .update({
        points_redeemed: rewards.points_redeemed + points,
        reward_history: [...(rewards.reward_history as any[]), {
          points,
          reward,
          redeemedAt: new Date().toISOString(),
        }],
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to redeem points",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Successfully redeemed ${points} points for ${reward}`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  const availablePoints = rewards ? rewards.points_earned - rewards.points_redeemed : 0;
  const rewardHistoryLength = rewards?.reward_history ? (rewards.reward_history as any[]).length : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Available Points"
          value={availablePoints.toString()}
          icon={Star}
        />
        <MetricCard
          title="Total Points Earned"
          value={rewards?.points_earned.toString() || "0"}
          icon={Award}
        />
        <MetricCard
          title="Rewards Redeemed"
          value={rewardHistoryLength.toString()}
          icon={Gift}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REWARD_TIERS.map(({ points, reward, icon }) => {
          const isUnlocked = availablePoints >= points;
          return (
            <RewardTierCard
              key={points}
              points={points}
              reward={reward}
              icon={icon}
              isUnlocked={isUnlocked}
              onRedeem={() => handleRedeemPoints(points, reward)}
            />
          );
        })}
      </div>
    </div>
  );
};