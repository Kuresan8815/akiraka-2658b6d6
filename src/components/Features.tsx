import { QrCode, Gift, LineChart, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export const Features = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: QrCode,
      title: "Product Transparency",
      description: "Scan and discover the environmental impact of products instantly"
    },
    {
      icon: Gift,
      title: "Earn Rewards",
      description: "Get rewarded for making sustainable choices"
    },
    {
      icon: LineChart,
      title: "Track Progress",
      description: "Monitor your sustainability journey with detailed insights"
    }
  ];

  return (
    <div className="py-2 bg-white/50 backdrop-blur-sm flex items-center flex-shrink-0">
      <div className="container mx-auto px-3 max-w-3xl">
        <Carousel className="relative mb-4">
          <CarouselContent>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <CarouselItem key={index}>
                  <div className="flex flex-col items-center text-center p-3 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm">
                    <div className="p-3 rounded-full bg-eco-primary/10 mb-2">
                      <Icon className="h-6 w-6 text-eco-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-eco-primary mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                      {feature.description}
                    </p>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="left-1" />
          <CarouselNext className="right-1" />
        </Carousel>
        
        <div className="flex flex-row gap-3 justify-center items-center">
          <Button 
            size="sm"
            className="min-w-[120px] bg-eco-primary hover:bg-eco-secondary"
            onClick={() => navigate("/signup")}
          >
            Sign Up
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            size="sm"
            className="min-w-[120px] bg-[#222222] text-white hover:bg-eco-secondary border-none"
            onClick={() => navigate("/login")}
          >
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
};