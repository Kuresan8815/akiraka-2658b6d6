import { useQuery } from "@tanstack/react-query";
import { Award, Gift, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { MetricCard } from "./MetricCard";

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
        reward_history: [...rewards.reward_history, {
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
          value={rewards?.reward_history.length.toString() || "0"}
          icon={Gift}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REWARD_TIERS.map(({ points, reward, icon: Icon }) => {
          const isUnlocked = availablePoints >= points;
          return (
            <Card key={points} className={!isUnlocked ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {points} Points
                </CardTitle>
                <Icon className={`h-4 w-4 ${isUnlocked ? "text-eco-primary" : "text-gray-400"}`} />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{reward}</p>
                <Button
                  onClick={() => handleRedeemPoints(points, reward)}
                  disabled={!isUnlocked}
                  className="w-full"
                >
                  {isUnlocked ? "Redeem Points" : "Locked"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};