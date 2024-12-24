import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MonthlyScansChart } from "./dashboard/MonthlyScansChart";
import { MilestoneProgress } from "./dashboard/MilestoneProgress";
import { RewardsDashboard } from "./dashboard/RewardsDashboard";

export const Dashboard = () => {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold text-eco-primary">Dashboard</h1>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Rewards & Points</h2>
        <RewardsDashboard />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <MonthlyScansChart />
          <MilestoneProgress />
        </div>
      </section>
    </div>
  );
};