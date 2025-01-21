import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

export const AuthSection = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize auth state and handle session recovery
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate("/");
        }
      } catch (error) {
        console.error("Session initialization error:", error);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN' && session) {
        navigate("/");
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed successfully");
      } else if (event === 'SIGNED_OUT') {
        // Clear any stored session data
        await supabase.auth.signOut();
        navigate("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.message) {
        case "Invalid login credentials":
          return "Invalid email or password. Please check your credentials and try again.";
        case "Email not confirmed":
          return "Please verify your email address before signing in.";
        case "Invalid Refresh Token: Refresh Token Not Found":
          return "Your session has expired. Please sign in again.";
        default:
          return error.message;
      }
    }
    return "An unexpected error occurred. Please try again.";
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success!",
        description: "Account created successfully. Please check your email to verify your account.",
      });
      setEmail("");
      setPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid Refresh Token")) {
          // Handle expired session
          await supabase.auth.signOut();
        }
        toast({
          title: "Error",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success!",
        description: "You have been signed in.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-eco-primary/5 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-sm mx-auto text-center">
          <h2 className="text-2xl font-bold text-eco-primary mb-4">
            Join Our Community
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Sign up or sign in to access your dashboard.
          </p>
          <form onSubmit={handleEmailSignUp} className="space-y-3">
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <Input
              type="password"
              placeholder="Enter your password"
              className="h-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              type="submit"
              size="lg" 
              className="w-full bg-eco-primary hover:bg-eco-secondary"
              disabled={isLoading}
            >
              Sign Up
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={(e) => handleEmailSignIn(e)}
              disabled={isLoading}
            >
              <Mail className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};