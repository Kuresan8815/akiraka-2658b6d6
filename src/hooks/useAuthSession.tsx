
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useAuthSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session error:", error);
        if (error.message.includes("Invalid Refresh Token")) {
          await handleSignOut();
          return null;
        }
        throw error;
      }
      return session;
    },
    retry: false,
    meta: {
      onError: (error: Error) => {
        console.error("Auth error:", error);
        if (error.message !== "Session not found") {
          handleSignOut();
        }
      },
    },
  });

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear any stored tokens
      window.localStorage.removeItem('supabase.auth.token');
      navigate("/login");
      toast({
        title: "Session Expired",
        description: "Please sign in again to continue.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      navigate("/login");
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
          if (!session) {
            navigate("/login");
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { session, isLoading };
};
