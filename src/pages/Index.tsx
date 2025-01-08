import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
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
      <div className="flex justify-center items-center h-[100dvh] bg-gradient-to-b from-eco-primary/10 to-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1482938289607-e9573fc25ebb)',
        }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-eco-primary/80 via-eco-primary/60 to-white/90 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        <header className="bg-eco-primary/90 backdrop-blur-sm text-white py-2 px-4">
          <h1 className="text-xl font-bold">Akiraka</h1>
        </header>
        <main className="flex-1 flex flex-col justify-between">
          <Hero />
          <Features />
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Index;