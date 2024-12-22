import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

export const AuthSection = () => {
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
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12"
              />
              <Button size="lg" className="bg-eco-primary hover:bg-eco-secondary">
                Sign Up
              </Button>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => {}}
            >
              <Mail className="mr-2 h-5 w-5" />
              Continue with Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};