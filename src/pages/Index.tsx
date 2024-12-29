import { useQuery } from "@tanstack/react-query";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { supabase } from "@/integrations/supabase/client";

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
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-eco-primary/10 to-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  if (session) {
    return <UserDashboard />;
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-eco-primary/10 to-white overflow-hidden">
      <header className="bg-eco-primary text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Akiraka</h1>
      </header>
      <main className="flex-grow flex flex-col">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Index;