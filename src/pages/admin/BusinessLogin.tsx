
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BusinessLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (!authData.user) {
        throw new Error("No user data returned after login");
      }

      // Check if user is a business admin using the new function name
      const { data: isBusinessAdmin, error: checkError } = await supabase
        .rpc('check_admin_user_access', {
          user_id: authData.user.id
        });

      if (checkError) {
        throw checkError;
      }

      if (!isBusinessAdmin) {
        await supabase.auth.signOut();
        throw new Error("Unauthorized access. Business admin privileges required.");
      }

      // Check if user has any business profiles
      const { data: businessProfiles, error: profileError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', authData.user.id);

      if (profileError) {
        throw profileError;
      }

      toast({
        title: "Success",
        description: "Welcome to the business admin dashboard",
      });
      
      // If user has no business profiles, redirect to settings to create one
      if (!businessProfiles || businessProfiles.length === 0) {
        navigate("/admin/settings", { replace: true });
      } else {
        // Otherwise, redirect to the dashboard
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Failed to sign in");
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-eco-primary mb-6">
          Business Admin Login
        </h1>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-eco-primary hover:bg-eco-secondary"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BusinessLogin;
