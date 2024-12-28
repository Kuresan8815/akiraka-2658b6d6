import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Dashboard } from "@/components/Dashboard";
import { Loader } from "lucide-react";

const Index = () => {
  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-eco-primary" />
      </div>
    );
  }

  if (session) {
    return <Dashboard />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Index;