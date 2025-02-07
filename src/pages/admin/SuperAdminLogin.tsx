
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SuperAdminLogin = () => {
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

      // Use the no_rls function to check super admin status
      const { data: isSuperAdmin, error: checkError } = await supabase
        .rpc('is_super_admin_no_rls', {
          user_id: authData.user.id
        });

      if (checkError) {
        throw checkError;
      }

      if (!isSuperAdmin) {
        await supabase.auth.signOut();
        throw new Error("Unauthorized access. Super admin privileges required.");
      }

      toast({
        title: "Success",
        description: "Welcome to the super admin dashboard",
      });
      
      // Route to the users management page instead of the default dashboard
      navigate("/admin/users", { replace: true });
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
          Super Admin Login
        </h1>
        <div className="mb-4 text-center text-sm text-gray-600">
          This login is restricted to super administrators only.
        </div>
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

export default SuperAdminLogin;
