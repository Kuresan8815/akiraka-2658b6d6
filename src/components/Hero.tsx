import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-eco-primary/10 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6">
          <div className="text-center animate-fade-up">
            <h1 className="text-3xl font-bold text-eco-primary mb-4">
              Your Journey to Sustainable Living
            </h1>
            <p className="text-base text-gray-600 mb-6">
              Join our community making a difference, one sustainable choice at a time.
            </p>
            <div className="flex flex-col gap-3">
              <Button size="lg" className="w-full bg-eco-primary hover:bg-eco-secondary">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="w-full">
                Learn More
              </Button>
            </div>
          </div>
          <div className="animate-fade-up [animation-delay:200ms] w-full max-w-[280px]">
            <div className="relative">
              <div className="absolute inset-0 bg-eco-primary/10 blur-2xl rounded-full"></div>
              <img
                src="/placeholder.svg"
                alt="App Preview"
                className="relative z-10 rounded-2xl shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};