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
    <div className="min-h-screen flex flex-col">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1482938289607-e9573fc25ebb)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-eco-primary/80 via-eco-primary/60 to-white/90 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="bg-eco-primary/90 backdrop-blur-sm text-white py-4 px-6">
          <h1 className="text-2xl font-bold">Akiraka</h1>
        </header>
        <main className="flex-grow flex flex-col">
          <Hero />
          <Features />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;