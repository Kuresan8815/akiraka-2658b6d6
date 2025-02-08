import { useToast } from "@/components/ui/use-toast";

export const useOnboardingValidation = () => {
  const { toast } = useToast();

  const validateStep = (
    currentSlide: number,
    selectedIndustry: string,
    createdBusinessId: string,
    selectedActivities: string[],
    selectedGoals: string[]
  ) => {
    if (currentSlide === 0 && !selectedIndustry) {
      toast({
        title: "Required",
        description: "Please select an industry to continue",
        variant: "destructive",
      });
      return false;
    }

    if (currentSlide === 1 && !createdBusinessId) {
      toast({
        title: "Required",
        description: "Please create your business profile to continue",
        variant: "destructive",
      });
      return false;
    }

    if (currentSlide === 2 && selectedActivities.length === 0) {
      toast({
        title: "Required",
        description: "Please select at least one activity",
        variant: "destructive",
      });
      return false;
    }

    if (currentSlide === 3 && selectedGoals.length === 0) {
      toast({
        title: "Required",
        description: "Please select at least one sustainability goal",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return { validateStep };
};