import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-eco-primary/10 to-white pt-20 pb-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center lg:text-left animate-fade-up">
            <h1 className="text-4xl md:text-6xl font-bold text-eco-primary mb-6">
              Your Journey to Sustainable Living Starts Here
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Join our community of eco-conscious individuals making a difference,
              one sustainable choice at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="bg-eco-primary hover:bg-eco-secondary">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
          <div className="flex-1 animate-fade-up [animation-delay:200ms]">
            <div className="relative mx-auto max-w-[320px]">
              <div className="absolute inset-0 bg-eco-primary/10 blur-3xl rounded-full"></div>
              <img
                src="/placeholder.svg"
                alt="App Preview"
                className="relative z-10 rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};