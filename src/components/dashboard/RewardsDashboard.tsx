import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PointsOverview } from "./PointsOverview";
import { MilestonesList } from "./MilestonesList";
import { RewardsList } from "./RewardsList";

const DEMO_DATA = {
  totalPoints: 1250,
  nextMilestonePoints: 2000,
  milestones: [
    { name: "Eco Newbie", points: 100, status: "Unlocked" as const },
    { name: "Eco Hero", points: 500, status: "Unlocked" as const },
    { name: "Eco Champion", points: 1000, status: "Unlocked" as const },
    { name: "Eco Legend", points: 2000, status: "Locked" as const },
  ],
  redeemableRewards: [
    {
      name: "10% Discount on Eco-Products",
      pointsRequired: 200,
      status: "Available" as const,
    },
    {
      name: "Reusable Water Bottle",
      pointsRequired: 500,
      status: "Available" as const,
    },
    {
      name: "Sustainable Tote Bag",
      pointsRequired: 1000,
      status: "Locked" as const,
    },
  ],
};

export const RewardsDashboard = () => {
  const { toast } = useToast();

  const { data: rewards, isLoading, error, refetch } = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleRedeem = async (reward: typeof DEMO_DATA.redeemableRewards[0]) => {
    toast({
      title: "Reward Redeemed!",
      description: `You have successfully redeemed: ${reward.name}`,
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

  // Use demo data for now, but in production this would use the rewards data
  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold text-eco-primary">Your Rewards</h2>
      
      <PointsOverview
        totalPoints={DEMO_DATA.totalPoints}
        nextMilestonePoints={DEMO_DATA.nextMilestonePoints}
      />
      
      <MilestonesList milestones={DEMO_DATA.milestones} />
      
      <RewardsList
        rewards={DEMO_DATA.redeemableRewards}
        onRedeem={handleRedeem}
      />
    </div>
  );
};