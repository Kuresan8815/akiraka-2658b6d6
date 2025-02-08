import { ChevronRight, Factory, Building2, ChartBar, Target } from "lucide-react";
import { IndustryStep } from "./onboarding/steps/IndustryStep";
import { BusinessStep } from "./onboarding/steps/BusinessStep";
import { ActivitiesStep } from "./onboarding/steps/ActivitiesStep";
import { GoalsStep } from "./onboarding/steps/GoalsStep";
import { OnboardingNavigation } from "./onboarding/components/OnboardingNavigation";
import { OnboardingSlide } from "./onboarding/components/OnboardingSlide";
import { useOnboarding } from "./onboarding/hooks/useOnboarding";

const slides = [
  {
    title: "Select Industry",
    description: "Choose your primary industry sector",
    icon: Factory,
    component: "IndustryStep",
  },
  {
    title: "Create Your Business",
    description: "Set up your business profile",
    icon: Building2,
    component: "BusinessStep",
  },
  {
    title: "Business Activities",
    description: "Select your sustainability activities",
    icon: ChartBar,
    component: "ActivitiesStep",
  },
  {
    title: "Sustainability Goals",
    description: "Set your environmental targets",
    icon: Target,
    component: "GoalsStep",
  },
];

export const OnboardingCarousel = () => {
  const {
    currentSlide,
    selectedIndustry,
    setSelectedIndustry,
    selectedActivities,
    setSelectedActivities,
    selectedGoals,
    setSelectedGoals,
    handleBusinessCreated,
    nextSlide,
    previousSlide,
  } = useOnboarding();

  const renderComponent = (componentName: string) => {
    switch (componentName) {
      case "IndustryStep":
        return (
          <IndustryStep
            selectedIndustry={selectedIndustry}
            onSelect={setSelectedIndustry}
          />
        );
      case "BusinessStep":
        return (
          <BusinessStep
            selectedIndustry={selectedIndustry}
            onBusinessCreated={handleBusinessCreated}
          />
        );
      case "ActivitiesStep":
        return (
          <ActivitiesStep
            selectedActivities={selectedActivities}
            onSelect={setSelectedActivities}
          />
        );
      case "GoalsStep":
        return (
          <GoalsStep
            selectedGoals={selectedGoals}
            onSelect={setSelectedGoals}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <OnboardingSlide
              key={index}
              title={slide.title}
              description={slide.description}
              icon={slide.icon}
            >
              {slide.component && renderComponent(slide.component)}
            </OnboardingSlide>
          ))}
        </div>
      </div>

      <OnboardingNavigation
        currentSlide={currentSlide}
        totalSlides={slides.length}
        onNext={nextSlide}
        onPrevious={previousSlide}
      />
    </div>
  );
};