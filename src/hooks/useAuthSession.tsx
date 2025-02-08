
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
      try {
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
      } catch (error) {
        console.error("Session fetch error:", error);
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
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
      // Clear ALL auth related storage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('supabase.auth.token');
        window.localStorage.removeItem('supabase.auth.expires_at');
        window.localStorage.removeItem('supabase.auth.refresh_token');
      }
      navigate("/admin/login");
      toast({
        title: "Session Expired",
        description: "Please sign in again to continue.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      // Force navigate to login even if sign out fails
      navigate("/admin/login");
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      if (event === "SIGNED_OUT") {
        navigate("/admin/login");
      } else if (event === "SIGNED_IN") {
        // Check admin status on sign in
        if (session?.user?.id) {
          try {
            const { data: isAdmin, error: checkError } = await supabase.rpc(
              'check_admin_user_access',
              { user_id: session.user.id }
            );

            if (checkError) throw checkError;

            if (!isAdmin) {
              await handleSignOut();
              toast({
                title: "Access Denied",
                description: "You do not have admin access.",
                variant: "destructive",
              });
            } else {
              // Successfully authenticated as admin
              navigate("/admin/dashboard");
            }
          } catch (error) {
            console.error("Admin check error:", error);
            await handleSignOut();
          }
        }
      } else if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed successfully");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return { session, isLoading };
};
