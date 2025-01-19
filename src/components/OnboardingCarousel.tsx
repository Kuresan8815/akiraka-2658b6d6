import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, QrCode, Award, ChartBar, Building2, Factory, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { BusinessSelect } from "./onboarding/BusinessSelect";
import { IndustrySelect } from "./onboarding/IndustrySelect";
import { ActivitiesSelect } from "./onboarding/ActivitiesSelect";
import { GoalsSelect } from "./onboarding/GoalsSelect";
import type { Business } from "@/types/business";

const slides = [
  {
    title: "Select Industry",
    description: "Choose your primary industry sector",
    icon: Factory,
    component: "IndustrySelect",
  },
  {
    title: "Select Your Business",
    description: "Choose the business you're associated with",
    icon: Building2,
    component: "BusinessSelect",
  },
  {
    title: "Business Activities",
    description: "Select your sustainability activities",
    icon: ChartBar,
    component: "ActivitiesSelect",
  },
  {
    title: "Sustainability Goals",
    description: "Set your environmental targets",
    icon: Target,
    component: "GoalsSelect",
  },
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
];

export const OnboardingCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    const { data, error } = await supabase
      .from("businesses")
      .select("id, name, business_type, industry_type, activities, sustainability_goals, created_at, updated_at, created_by, is_active")
      .eq("is_active", true);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load businesses. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setBusinesses(data || []);
  };

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

    if (currentSlide === 1 && !selectedBusiness) {
      toast({
        title: "Required",
        description: "Please select a business to continue",
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
      .eq("id", selectedBusiness);

    if (businessError) {
      toast({
        title: "Error",
        description: "Failed to update business information",
        variant: "destructive",
      });
      return;
    }

    // Create business profile
    const { error: profileError } = await supabase
      .from("business_profiles")
      .insert({
        business_id: selectedBusiness,
        user_id: user.id,
        role: "member",
      });

    if (profileError) {
      toast({
        title: "Error",
        description: "Failed to create business profile",
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

    toast({
      title: "Welcome!",
      description: "Onboarding completed successfully",
    });

    navigate("/dashboard");
  };

  const skipOnboarding = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ has_completed_onboarding: true })
        .eq("id", user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
        return;
      }
    }

    navigate("/dashboard");
  };

  const renderComponent = (componentName: string) => {
    switch (componentName) {
      case "IndustrySelect":
        return (
          <IndustrySelect
            selectedIndustry={selectedIndustry}
            onSelect={setSelectedIndustry}
          />
        );
      case "BusinessSelect":
        return (
          <BusinessSelect
            businesses={businesses}
            selectedBusiness={selectedBusiness}
            onSelect={setSelectedBusiness}
          />
        );
      case "ActivitiesSelect":
        return (
          <ActivitiesSelect
            selectedActivities={selectedActivities}
            onSelect={setSelectedActivities}
          />
        );
      case "GoalsSelect":
        return (
          <GoalsSelect
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
        <Button onClick={nextSlide}>
          {currentSlide === slides.length - 1 ? "Complete" : "Next"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};