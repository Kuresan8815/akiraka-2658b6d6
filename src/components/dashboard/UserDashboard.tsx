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
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    }
  };

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
      
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-bold text-eco-primary mb-4 uppercase">Quick Actions</h2>
        <QuickActions />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-bold text-eco-primary mb-4 uppercase">My Sustainability Impact</h2>
        <div className="transform hover:scale-105 transition-transform duration-200">
          <StatsGrid totalCarbonSaved={totalCarbonSaved} totalWaterSaved={totalWaterSaved} />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-bold text-eco-primary mb-4 uppercase">Progress</h2>
        <DashboardProgress 
          pointsEarned={rewards?.points_earned || 0}
          pointsToNextMilestone={pointsToNextMilestone}
        />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-bold text-eco-primary mb-4 uppercase">Achievements</h2>
        <Achievements achievements={achievements} />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-bold text-eco-primary mb-4 uppercase">Daily Eco Tip</h2>
        <DailyTip />
      </div>

      <div className="grid gap-4 md:grid-cols-2 border-t border-gray-200 pt-6">
        <div>
          <h2 className="text-xl font-bold text-eco-primary mb-4 uppercase">Monthly Activity</h2>
          <MonthlyScansChart data={[
            { month: "Jan", scans: 10 },
            { month: "Feb", scans: 15 },
            { month: "Mar", scans: 20 },
          ]} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-eco-primary mb-4 uppercase">Product Scanned Milestone</h2>
          <MilestoneProgress
            scannedProducts={scanHistory?.length || 0}
            targetProducts={50}
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 flex flex-col items-center">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full max-w-xs"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
        <p className="text-sm text-gray-600 mt-4 text-center">
          Thank you for being part of the sustainability revolution!
        </p>
      </div>
    </div>
  );
};