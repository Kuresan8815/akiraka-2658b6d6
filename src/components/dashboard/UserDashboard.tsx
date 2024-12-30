import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DashboardHeader } from "./DashboardHeader";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TabNavigation } from "@/components/navigation/TabNavigation";
import { DashboardGrid } from "./DashboardGrid";

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
        .maybeSingle();

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
        .maybeSingle();

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

  if (!profile || !rewards) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertDescription>
            We couldn't load your profile data. Please try signing out and back in.
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={handleLogout} className="mt-4">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    );
  }

  const totalCarbonSaved = scanHistory?.reduce(
    (total, scan) => total + (scan.products?.carbon_footprint || 0),
    0
  ) || 0;

  const totalWaterSaved = scanHistory?.reduce(
    (total, scan) => total + (scan.products?.water_usage || 0),
    0
  ) || 0;

  const achievements = Array.isArray(rewards?.reward_history)
    ? rewards.reward_history
    : [];
  const pointsToNextMilestone = 100 - (rewards?.points_earned % 100);

  return (
    <div className="min-h-screen pb-16">
      <header className="fixed top-0 left-0 right-0 z-10 bg-gradient-to-r from-eco-primary to-eco-secondary border-b border-gray-200">
        <div className="flex justify-between items-center px-4 h-16">
          <h1 className="text-lg font-semibold text-white">Akiraka</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white hover:text-white hover:bg-white/20"
          >
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto animate-fade-up mt-16">
        <DashboardHeader profile={profile} session={session} />
        
        <DashboardGrid
          rewards={rewards}
          scanHistory={scanHistory || []}
          achievements={achievements}
          pointsToNextMilestone={pointsToNextMilestone}
          totalCarbonSaved={totalCarbonSaved}
          totalWaterSaved={totalWaterSaved}
        />

        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full max-w-xs"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>

      <TabNavigation />
    </div>
  );
};