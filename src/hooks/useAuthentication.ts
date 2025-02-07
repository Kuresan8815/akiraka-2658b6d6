
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAuthentication = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = "Invalid email or password";
        if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please verify your email before logging in";
        }
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (data?.user) {
        // Check user role and redirect accordingly
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('account_level')
          .eq('id', data.user.id)
          .maybeSingle();

        let redirectPath = "/";
        if (adminData?.account_level === 'super_admin') {
          redirectPath = "/admin/usermgt";
        } else if (adminData?.account_level === 'business') {
          redirectPath = "/admin/dashboard";
        }

        toast({
          title: "Success!",
          description: "You have been signed in.",
        });
        
        navigate(redirectPath);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    isLoading,
  };
};
