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
      const { data: { session } } = await supabase.auth.getSession();
      return session;
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
    await supabase.auth.signOut();
    navigate("/");
    toast({
      title: "Session Expired",
      description: "Please sign in again to continue.",
      variant: "destructive",
    });
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/");
        } else if (!session && !isLoading) {
          navigate("/");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, isLoading]);

  return { session, isLoading };
};