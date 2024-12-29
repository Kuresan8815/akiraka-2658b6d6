import { QrCode, Gift, LineChart } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "./ui/button";
import { useState } from "react";

export const Features = () => {
  const [isComplete, setIsComplete] = useState(false);
  const features = [
    {
      icon: QrCode,
      title: "Product Transparency",
      description: "Scan and discover the environmental impact of products instantly"
    },
    {
      icon: Gift,
      title: "Earn Rewards",
      description: "Get rewarded for making sustainable choices and tracking your impact"
    },
    {
      icon: LineChart,
      title: "Track Progress",
      description: "Monitor your sustainability journey with detailed insights and metrics"
    }
  ];

  if (isComplete) {
    return null;
  }

  return (
    <div className="py-8 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 max-w-3xl">
        <Carousel className="relative">
          <CarouselContent>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <CarouselItem key={index}>
                  <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm">
                    <div className="p-3 rounded-full bg-eco-primary/10 mb-4">
                      <Icon className="h-6 w-6 text-eco-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-eco-primary mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {feature.description}
                    </p>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
        
        <div className="mt-6 flex justify-center">
          <Button 
            variant="ghost" 
            onClick={() => setIsComplete(true)}
            className="text-gray-600 hover:text-eco-primary"
          >
            Skip Features
          </Button>
        </div>
      </div>
    </div>
  );
};