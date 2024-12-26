import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Leaf, Droplet, QrCode, Gift, History, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { MetricCard } from "./MetricCard";
import { MilestoneProgress } from "./MilestoneProgress";
import { MonthlyScansChart } from "./MonthlyScansChart";

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

  const achievements = rewards?.reward_history || [];
  const pointsToNextMilestone = 100 - (rewards?.points_earned % 100);

  return (
    <div className="container mx-auto p-4 space-y-6 animate-fade-up">
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={session.user.user_metadata?.avatar_url} />
          <AvatarFallback>{profile?.name?.[0] || session.user.email?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">
            Hello, {profile?.name || session.user.email?.split("@")[0]}!
          </h1>
          <p className="text-gray-600">Your sustainable choices make a difference!</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <Button
          onClick={() => navigate("/scan")}
          className="bg-eco-primary hover:bg-eco-secondary"
        >
          <QrCode className="mr-2" />
          Scan QR
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/rewards")}
        >
          <Gift className="mr-2" />
          Rewards
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/history")}
        >
          <History className="mr-2" />
          History
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          title="Carbon Footprint Saved"
          value={`${totalCarbonSaved.toFixed(1)} kg`}
          icon={Leaf}
        />
        <MetricCard
          title="Water Usage Saved"
          value={`${totalWaterSaved.toFixed(0)} L`}
          icon={Droplet}
        />
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Milestone Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={(rewards?.points_earned % 100)} className="h-2" />
          <p className="text-sm text-gray-500 mt-2">
            {pointsToNextMilestone} points away from your next milestone!
          </p>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {achievements.map((achievement: any, index: number) => (
              <div
                key={index}
                className="p-4 border rounded-lg text-center bg-gray-50"
              >
                <p className="font-medium">{achievement.name}</p>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Tip */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily Eco Tip</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Switch off unused lights to save energy and reduce your carbon footprint!
          </p>
          <Button variant="link" className="mt-2 p-0">
            See More Tips
          </Button>
        </CardContent>
      </Card>

      {/* Charts */}
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