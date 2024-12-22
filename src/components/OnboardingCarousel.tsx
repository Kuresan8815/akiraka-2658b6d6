import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, QrCode, Award, ChartBar } from "lucide-react";

const slides = [
  {
    title: "Scan and Verify Products",
    description: "Scan QR codes for real-time sustainability data",
    icon: QrCode,
  },
  {
    title: "Earn Rewards",
    description: "Get points for sustainable purchases",
    icon: Award,
  },
  {
    title: "Track Your Impact",
    description: "Monitor your sustainability journey",
    icon: ChartBar,
  },
];

export const OnboardingCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? prev : prev + 1));
  };

  const skipOnboarding = () => {
    // Handle skip action
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <div className="flex flex-col items-center gap-4 text-center p-4">
                <div className="w-16 h-16 bg-eco-primary/10 rounded-full flex items-center justify-center">
                  <slide.icon className="w-8 h-8 text-eco-primary" />
                </div>
                <h3 className="text-xl font-bold text-eco-primary">{slide.title}</h3>
                <p className="text-gray-600">{slide.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <Button variant="ghost" onClick={skipOnboarding}>
          Skip
        </Button>
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                currentSlide === index ? "bg-eco-primary" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <Button onClick={nextSlide} disabled={currentSlide === slides.length - 1}>
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};