import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft, QrCode, Award, ChartBar, Building2, Factory, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { IndustryStep } from "./onboarding/steps/IndustryStep";
import { BusinessStep } from "./onboarding/steps/BusinessStep";
import { ActivitiesStep } from "./onboarding/steps/ActivitiesStep";
import { GoalsStep } from "./onboarding/steps/GoalsStep";

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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [createdBusinessId, setCreatedBusinessId] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const nextSlide = async () => {
    // Validation for each step
    if (currentSlide === 0 && !selectedIndustry) {
      toast({
        title: "Required",
        description: "Please select an industry to continue",
        variant: "destructive",
      });
      return;
    }

    if (currentSlide === 1 && !createdBusinessId) {
      toast({
        title: "Required",
        description: "Please create your business profile to continue",
        variant: "destructive",
      });
      return;
    }

    if (currentSlide === 2 && selectedActivities.length === 0) {
      toast({
        title: "Required",
        description: "Please select at least one activity",
        variant: "destructive",
      });
      return;
    }

    if (currentSlide === 3 && selectedGoals.length === 0) {
      toast({
        title: "Required",
        description: "Please select at least one sustainability goal",
        variant: "destructive",
      });
      return;
    }

    if (currentSlide === slides.length - 1) {
      await completeOnboarding();
      return;
    }

    setCurrentSlide((prev) => prev + 1);
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const completeOnboarding = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "User session not found",
        variant: "destructive",
      });
      return;
    }

    // Update business with selected options
    const { error: businessError } = await supabase
      .from("businesses")
      .update({
        industry_type: selectedIndustry,
        activities: selectedActivities,
        sustainability_goals: selectedGoals
      })
      .eq("id", createdBusinessId);

    if (businessError) {
      toast({
        title: "Error",
        description: "Failed to update business information",
        variant: "destructive",
      });
      return;
    }

    // Update user profile onboarding status
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ has_completed_onboarding: true })
      .eq("id", user.id);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      return;
    }

    // Update user's current business ID in auth metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: { current_business_id: createdBusinessId }
    });

    if (authError) {
      toast({
        title: "Error",
        description: "Failed to set current business",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Welcome!",
      description: "Onboarding completed successfully",
    });

    navigate("/dashboard");
  };

  const handleBusinessCreated = (businessId: string) => {
    setCreatedBusinessId(businessId);
    nextSlide();
  };

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
            <div key={index} className="w-full flex-shrink-0">
              <div className="flex flex-col items-center gap-4 text-center p-4">
                <div className="w-16 h-16 bg-eco-primary/10 rounded-full flex items-center justify-center">
                  <slide.icon className="w-8 h-8 text-eco-primary" />
                </div>
                <h3 className="text-xl font-bold text-eco-primary">{slide.title}</h3>
                <p className="text-gray-600">{slide.description}</p>
                {slide.component && renderComponent(slide.component)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        {currentSlide > 0 ? (
          <Button variant="outline" onClick={previousSlide}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : (
          <div></div>
        )}
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
        <Button onClick={nextSlide}>
          {currentSlide === slides.length - 1 ? "Complete" : "Next"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};