import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft } from "lucide-react";

interface OnboardingNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onNext: () => void;
  onPrevious: () => void;
}

export const OnboardingNavigation = ({
  currentSlide,
  totalSlides,
  onNext,
  onPrevious,
}: OnboardingNavigationProps) => {
  return (
    <div className="flex justify-between items-center mt-8">
      {currentSlide > 0 ? (
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      ) : (
        <div></div>
      )}
      <div className="flex gap-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              currentSlide === index ? "bg-eco-primary" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
      <Button onClick={onNext}>
        {currentSlide === totalSlides - 1 ? "Complete" : "Next"}
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};