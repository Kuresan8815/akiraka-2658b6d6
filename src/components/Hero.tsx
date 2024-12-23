import { Button } from "@/components/ui/button";
import { ArrowRight, QrCode } from "lucide-react";
import { OnboardingCarousel } from "./OnboardingCarousel";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-eco-primary/10 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-2xl font-bold text-eco-primary">
            Welcome to Akiraka
            <span className="block text-lg font-normal mt-2">
              Your Sustainability Companion
            </span>
          </h1>
          <p className="text-sm text-gray-600">
            Empowering Transparent and Rewarding Sustainable Choices
          </p>
        </div>

        <OnboardingCarousel />

        <div className="flex flex-col gap-3 mt-8">
          <Button
            size="lg"
            className="w-full bg-eco-primary hover:bg-eco-secondary"
            onClick={() => navigate("/scan")}
          >
            <QrCode className="mr-2" />
            Scan Product
          </Button>
          <Button size="lg" className="w-full bg-eco-primary hover:bg-eco-secondary">
            Sign Up
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="w-full">
            Log In
          </Button>
        </div>
      </div>

      <footer className="text-center text-sm text-gray-600 mt-8">
        Your journey towards sustainability starts here.
      </footer>
    </div>
  );
};