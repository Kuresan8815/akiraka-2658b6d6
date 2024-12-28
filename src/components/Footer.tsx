import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="py-12 border-t bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-eco-primary mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of conscious consumers making a difference today.
          </p>
          <Button 
            size="lg"
            className="bg-eco-primary hover:bg-eco-secondary mb-8"
            onClick={() => navigate("/signup")}
          >
            Get Started Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <div className="flex justify-center gap-6 text-sm">
            <a 
              href="#" 
              className="text-gray-600 hover:text-eco-primary transition-colors"
              aria-label="Read our Privacy Policy"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-gray-600 hover:text-eco-primary transition-colors"
              aria-label="Read our Terms of Service"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};