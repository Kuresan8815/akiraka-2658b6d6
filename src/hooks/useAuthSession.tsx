
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase, signOut } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useAuthSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }
        
        if (!session) {
          throw new Error("No active session");
        }
        
        return session;
      } catch (error: any) {
        // Handle token refresh errors
        if (error.message?.includes('refresh_token_not_found')) {
          await handleSignOut();
          throw new Error('Your session has expired. Please sign in again.');
        }
        throw error;
      }
    },
    retry: false,
    meta: {
      onError: (error: Error) => {
        console.error("Auth error:", error);
        handleSignOut();
      },
    },
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/admin/login");
      toast({
        title: "Session Expired",
        description: "Please sign in again to continue.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      // Force navigation even if sign out fails
      navigate("/admin/login");
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === "SIGNED_OUT") {
          navigate("/admin/login");
        } else if (!session && !isLoading) {
          navigate("/admin/login");
        } else if (event === "TOKEN_REFRESHED") {
          console.log("Token refreshed successfully");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, isLoading]);

  return { session, isLoading, error };
};
