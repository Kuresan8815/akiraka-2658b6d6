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
      // Here we would typically integrate with an authentication service
      // For now, we'll just show a success message
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
    <div className="bg-eco-primary/5 py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold text-eco-primary mb-6">
            Join Our Community
          </h2>
          <p className="text-gray-600 mb-8">
            Start your sustainable journey today. Sign up for early access and
            exclusive updates.
          </p>
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <Button 
                type="submit"
                size="lg" 
                className="bg-eco-primary hover:bg-eco-secondary"
                disabled={isLoading}
              >
                Sign Up
              </Button>
            </div>
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
              <Mail className="mr-2 h-5 w-5" />
              Continue with Email
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};