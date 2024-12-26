import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DashboardHeader } from "./DashboardHeader";
import { QuickActions } from "./QuickActions";
import { StatsGrid } from "./StatsGrid";
import { DashboardProgress } from "./DashboardProgress";
import { Achievements } from "./Achievements";
import { DailyTip } from "./DailyTip";
import { MonthlyScansChart } from "./MonthlyScansChart";
import { MilestoneProgress } from "./MilestoneProgress";

// Type guard to check if a value is an array
const isArray = (value: unknown): value is Array<unknown> => Array.isArray(value);

export const UserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user?.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: rewards } = useQuery({
    queryKey: ["rewards", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("user_id", session?.user?.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: scanHistory } = useQuery({
    queryKey: ["scan_history", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scan_history")
        .select("*, products(*)")
        .eq("user_id", session?.user?.id);

      if (error) throw error;
      return data;
    },
  });

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please sign in to view your dashboard</p>
      </div>
    );
  }

  if (isProfileLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  const totalCarbonSaved = scanHistory?.reduce((total, scan) => 
    total + (scan.products?.carbon_footprint || 0), 0) || 0;

  const totalWaterSaved = scanHistory?.reduce((total, scan) => 
    total + (scan.products?.water_usage || 0), 0) || 0;

  const achievements = isArray(rewards?.reward_history) ? rewards.reward_history : [];
  const pointsToNextMilestone = 100 - (rewards?.points_earned % 100);

  return (
    <div className="container mx-auto p-4 space-y-6 animate-fade-up">
      <DashboardHeader profile={profile} session={session} />
      <QuickActions />
      <StatsGrid totalCarbonSaved={totalCarbonSaved} totalWaterSaved={totalWaterSaved} />
      <DashboardProgress 
        pointsEarned={rewards?.points_earned || 0}
        pointsToNextMilestone={pointsToNextMilestone}
      />
      <Achievements achievements={achievements} />
      <DailyTip />
      <div className="grid gap-4 md:grid-cols-2">
        <MonthlyScansChart data={[
          { month: "Jan", scans: 10 },
          { month: "Feb", scans: 15 },
          { month: "Mar", scans: 20 },
        ]} />
        <MilestoneProgress
          scannedProducts={scanHistory?.length || 0}
          targetProducts={50}
        />
      </div>
    </div>
  );
};