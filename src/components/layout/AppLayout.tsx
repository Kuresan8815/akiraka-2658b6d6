import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TabNavigation } from "../navigation/TabNavigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: session, isLoading, error } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session error:", error);
        throw error;
      }
      return session;
    },
    retry: false,
    onError: (error) => {
      console.error("Auth error:", error);
      // Clear any stale session data
      supabase.auth.signOut().then(() => {
        navigate("/");
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
      });
    },
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        navigate("/");
      } else if (!session && !isLoading) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Success",
        description: "You have been logged out successfully.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <header className="fixed top-0 left-0 right-0 z-10 bg-gradient-to-r from-eco-primary to-eco-secondary border-b border-gray-200">
        <div className="flex justify-between items-center px-4 h-16">
          <h1 className="text-lg font-semibold text-white">Akiraka</h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:text-white hover:bg-white/20"
            >
              Logout
            </Button>
            <Avatar
              className="cursor-pointer"
              onClick={() => navigate("/profile")}
            />
          </div>
        </div>
      </header>

      <main className="mt-16 container mx-auto px-4">
        {children}
      </main>

      <TabNavigation />
    </div>
  );
};