import { useQuery } from "@tanstack/react-query";
import { Award, Gift, Star, Trophy, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MILESTONES = [
  { name: "Eco Newbie", points: 100, icon: Star },
  { name: "Eco Hero", points: 500, icon: Award },
  { name: "Eco Champion", points: 1000, icon: Trophy },
  { name: "Eco Legend", points: 2000, icon: Gift },
];

const REDEEMABLE_REWARDS = [
  { name: "10% Discount on Eco-Products", pointsRequired: 200, description: "Get 10% off your next eco-friendly purchase" },
  { name: "Reusable Water Bottle", pointsRequired: 500, description: "Premium eco-friendly water bottle" },
  { name: "Sustainable Tote Bag", pointsRequired: 1000, description: "Stylish and sustainable shopping bag" },
];

export const RewardsDashboard = () => {
  const { toast } = useToast();

  const { data: rewards, isLoading, error, refetch } = useQuery({
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

  const handleRedeemReward = async (pointsRequired: number, rewardName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to redeem rewards",
        variant: "destructive",
      });
      return;
    }

    if (!rewards || rewards.points_earned - rewards.points_redeemed < pointsRequired) {
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
        points_redeemed: rewards.points_redeemed + pointsRequired,
        reward_history: [...(rewards.reward_history as any[]), {
          points: pointsRequired,
          reward: rewardName,
          redeemedAt: new Date().toISOString(),
        }],
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to redeem reward",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Successfully redeemed ${rewardName}`,
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-semibold">Unable to load rewards</h3>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  const availablePoints = rewards ? rewards.points_earned - rewards.points_redeemed : 0;
  const nextMilestone = MILESTONES.find(m => m.points > availablePoints) || MILESTONES[MILESTONES.length - 1];
  const progress = (availablePoints / nextMilestone.points) * 100;

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-6 p-4">
        {/* Points Overview */}
        <Card className="border-eco-primary">
          <CardHeader>
            <CardTitle className="text-center">
              <span className="text-3xl font-bold text-eco-primary">{availablePoints}</span>
              <span className="text-lg ml-2">Points Available</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                {availablePoints} / {nextMilestone.points} points to {nextMilestone.name}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Milestones</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {MILESTONES.map(({ name, points, icon: Icon }) => {
              const isUnlocked = availablePoints >= points;
              return (
                <Card key={name} className={!isUnlocked ? "opacity-60" : ""}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{name}</CardTitle>
                    <Icon className={`h-4 w-4 ${isUnlocked ? "text-eco-primary" : "text-gray-400"}`} />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{points} points required</p>
                    <Badge variant={isUnlocked ? "default" : "secondary"} className="mt-2">
                      {isUnlocked ? "Unlocked" : "Locked"}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Redeemable Rewards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Redeemable Rewards</h3>
          <div className="grid gap-4">
            {REDEEMABLE_REWARDS.map((reward) => {
              const isAvailable = availablePoints >= reward.pointsRequired;
              return (
                <Card 
                  key={reward.name}
                  className={`${isAvailable ? "border-eco-primary" : "opacity-60"}`}
                >
                  <CardHeader>
                    <CardTitle className="text-base">{reward.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{reward.pointsRequired} points</span>
                      <Button
                        onClick={() => handleRedeemReward(reward.pointsRequired, reward.name)}
                        disabled={!isAvailable}
                      >
                        Redeem
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};