import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !name) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error("Signup error:", authError);
        toast({
          title: "Error",
          description: authError.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (authData?.user) {
        // Create initial profile data
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              name: name,
              sustainability_goals: [],
              preferences: {
                notifications: true,
                darkTheme: false
              }
            }
          ]);

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Even if profile creation fails, the user account is created
          toast({
            title: "Warning",
            description: "Account created but profile setup failed. Please try updating your profile later.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success!",
            description: "Account created successfully. You can now sign in.",
          });
        }
        
        // Clear the form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setName("");
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join our community of sustainable shoppers"
    >
      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Enter your name"
              className="pl-10"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
              minLength={2}
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="email"
              placeholder="Enter your email"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="password"
              placeholder="Create password"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={6}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="password"
              placeholder="Confirm password"
              className="pl-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={6}
            />
          </div>
        </div>

        <Button 
          type="submit"
          className="w-full bg-eco-primary hover:bg-eco-secondary"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Button
            variant="link"
            className="p-0 text-eco-primary"
            onClick={() => navigate("/login")}
          >
            Sign In
          </Button>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignUp;