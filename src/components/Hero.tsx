import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center py-6">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-eco-primary animate-fade-up">
          Track Your Sustainable Impact
          <span className="block text-lg md:text-xl font-normal mt-2 text-gray-600">
            Join thousands making conscious choices for a better planet
          </span>
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up animation-delay-200">
          <Button 
            size="lg" 
            className="w-full sm:w-auto min-w-[200px] bg-eco-primary hover:bg-eco-secondary"
            onClick={() => navigate("/signup")}
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto min-w-[200px]"
            onClick={() => navigate("/login")}
          >
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
};