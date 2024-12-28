import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col justify-center py-12 animate-fade-up">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-eco-primary">
            Empowering Sustainable Choices
            <span className="block text-xl md:text-2xl font-normal mt-4 text-gray-600">
              Track your impact, earn rewards, and make a difference with every sustainable choice
            </span>
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto mt-8">
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
      </div>
    </div>
  );
};