import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, QrCode, Award, ChartBar, Building2, Factory, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

interface Business {
  id: string;
  name: string;
  business_type: string;
  industry_type?: string;
  activities?: string[];
  sustainability_goals?: string[];
}

const industryTypes = [
  "Manufacturing",
  "Retail",
  "Energy",
  "Agriculture",
  "Transportation",
  "Construction",
  "Technology",
  "Other"
];

const activities = [
  "Product Manufacturing",
  "Renewable Energy",
  "Waste Management",
  "Supply Chain Optimization",
  "Sustainable Packaging",
  "Carbon Offsetting",
  "Green Transportation",
  "Recycling Programs"
];

const sustainabilityGoals = [
  "Reduce Carbon Emissions",
  "Improve Energy Efficiency",
  "Increase Recyclability",
  "Reduce Water Usage",
  "Sustainable Sourcing",
  "Zero Waste",
  "Renewable Energy Adoption",
  "Biodiversity Protection"
];

const slides = [
  {
    title: "Select Your Business",
    description: "Choose the business you're associated with",
    icon: Building2,
    component: "BusinessSelect",
  },
  {
    title: "Select Industry",
    description: "Choose your primary industry",
    icon: Factory,
    component: "IndustrySelect",
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
      .select("id, name, business_type, industry_type, activities, sustainability_goals")
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
    if (currentSlide === 0 && !selectedBusiness) {
      toast({
        title: "Required",
        description: "Please select a business to continue",
        variant: "destructive",
      });
      return;
    }

    if (currentSlide === 1 && !selectedIndustry) {
      toast({
        title: "Required",
        description: "Please select an industry to continue",
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

  const renderBusinessSelect = () => (
    <div className="w-full max-w-xs mx-auto">
      <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a business" />
        </SelectTrigger>
        <SelectContent>
          {businesses.map((business) => (
            <SelectItem key={business.id} value={business.id}>
              {business.name} ({business.business_type})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderIndustrySelect = () => (
    <div className="w-full max-w-xs mx-auto">
      <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select your industry" />
        </SelectTrigger>
        <SelectContent>
          {industryTypes.map((industry) => (
            <SelectItem key={industry} value={industry}>
              {industry}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderActivitiesSelect = () => (
    <div className="w-full max-w-xs mx-auto space-y-4">
      {activities.map((activity) => (
        <div key={activity} className="flex items-center space-x-2">
          <Checkbox
            id={activity}
            checked={selectedActivities.includes(activity)}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedActivities([...selectedActivities, activity]);
              } else {
                setSelectedActivities(selectedActivities.filter(a => a !== activity));
              }
            }}
          />
          <label htmlFor={activity} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {activity}
          </label>
        </div>
      ))}
    </div>
  );

  const renderGoalsSelect = () => (
    <div className="w-full max-w-xs mx-auto space-y-4">
      {sustainabilityGoals.map((goal) => (
        <div key={goal} className="flex items-center space-x-2">
          <Checkbox
            id={goal}
            checked={selectedGoals.includes(goal)}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedGoals([...selectedGoals, goal]);
              } else {
                setSelectedGoals(selectedGoals.filter(g => g !== goal));
              }
            }}
          />
          <label htmlFor={goal} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {goal}
          </label>
        </div>
      ))}
    </div>
  );

  const renderComponent = (componentName: string) => {
    switch (componentName) {
      case "BusinessSelect":
        return renderBusinessSelect();
      case "IndustrySelect":
        return renderIndustrySelect();
      case "ActivitiesSelect":
        return renderActivitiesSelect();
      case "GoalsSelect":
        return renderGoalsSelect();
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