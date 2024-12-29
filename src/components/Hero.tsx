import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[40vh]">
      <div className="max-w-4xl mx-auto text-center space-y-6 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-eco-primary animate-fade-up">
          Track Your Sustainable Journey
          <span className="block text-lg md:text-xl font-normal mt-2 text-gray-600">
            Make informed choices for a better planet
          </span>
        </h1>
        
        <div className="flex flex-row gap-4 justify-center items-center animate-fade-up animation-delay-200">
          <Button 
            size="lg" 
            className="min-w-[140px] bg-eco-primary hover:bg-eco-secondary"
            onClick={() => navigate("/signup")}
          >
            Sign Up
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="min-w-[140px]"
            onClick={() => navigate("/login")}
          >
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
};