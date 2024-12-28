import { Button } from "@/components/ui/button";
import { ArrowRight, QrCode } from "lucide-react";
import { OnboardingCarousel } from "./OnboardingCarousel";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col justify-between bg-gradient-to-b from-eco-primary/10 to-white py-8 animate-fade-up">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-eco-primary">
            Welcome to Akiraka
            <span className="block text-xl md:text-2xl font-normal mt-2">
              Your Sustainability Companion
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Empowering Transparent and Rewarding Sustainable Choices. Track your impact, 
            earn rewards, and make a difference with every sustainable choice you make.
          </p>
        </div>

        <OnboardingCarousel />

        <div className="flex flex-col gap-3 mt-8 max-w-md mx-auto">
          <Button
            size="lg"
            className="w-full bg-eco-primary hover:bg-eco-secondary"
            onClick={() => navigate("/scan")}
          >
            <QrCode className="mr-2" />
            Scan Product
          </Button>
          <Button 
            size="lg" 
            className="w-full bg-eco-primary hover:bg-eco-secondary"
            onClick={() => navigate("/signup")}
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full"
            onClick={() => navigate("/login")}
          >
            Log In
          </Button>
        </div>
      </div>

      <div className="text-center text-sm text-gray-600 mt-8">
        Join thousands of conscious consumers making a difference today
      </div>
    </div>
  );
};