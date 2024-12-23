import { Hero } from "@/components/Hero";
import { Dashboard } from "@/components/Dashboard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  return (
    <div className="min-h-screen">
      {session ? <Dashboard /> : <Hero />}
    </div>
  );
};

export default Index;