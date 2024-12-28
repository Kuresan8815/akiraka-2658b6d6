import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col justify-center py-12 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold text-eco-primary animate-fade-up">
          Track Your Sustainable Impact
          <span className="block text-xl md:text-2xl font-normal mt-4 text-gray-600">
            Join thousands making conscious choices for a better planet
          </span>
        </h1>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-up animation-delay-100">
          Scan products, earn rewards, and make a real difference with every sustainable choice.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 animate-fade-up animation-delay-200">
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