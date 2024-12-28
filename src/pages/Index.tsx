import { Hero } from "@/components/Hero";
import { Dashboard } from "@/components/Dashboard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {session ? <Dashboard /> : <Hero />}
    </div>
  );
};

export default Index;