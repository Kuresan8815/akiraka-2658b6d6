import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AuthSection = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      toast({
        title: "Success!",
        description: "Check your email for further instructions.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
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
            Sign up for early access and updates.
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
            <Button 
              type="submit"
              size="lg" 
              className="w-full bg-eco-primary hover:bg-eco-secondary"
              disabled={isLoading}
            >
              Sign Up
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "Email sign-in will be available soon!",
                });
              }}
              disabled={isLoading}
            >
              <Mail className="mr-2 h-4 w-4" />
              Continue with Email
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};