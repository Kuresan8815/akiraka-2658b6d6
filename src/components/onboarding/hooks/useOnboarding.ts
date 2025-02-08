import { useOnboardingState } from "./useOnboardingState";
import { useOnboardingValidation } from "./useOnboardingValidation";
import { useOnboardingCompletion } from "./useOnboardingCompletion";

export const useOnboarding = () => {
  const {
    currentSlide,
    setCurrentSlide,
    selectedIndustry,
    setSelectedIndustry,
    selectedActivities,
    setSelectedActivities,
    selectedGoals,
    setSelectedGoals,
    createdBusinessId,
    setCreatedBusinessId,
  } = useOnboardingState();

  const { validateStep } = useOnboardingValidation();
  const { completeOnboarding } = useOnboardingCompletion();

  const nextSlide = async () => {
    if (!validateStep(currentSlide, selectedIndustry, createdBusinessId, selectedActivities, selectedGoals)) {
      return;
    }

    if (currentSlide === 3) {
      await completeOnboarding(createdBusinessId, selectedIndustry, selectedActivities, selectedGoals);
      return;
    }

    setCurrentSlide((prev) => prev + 1);
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleBusinessCreated = (businessId: string) => {
    setCreatedBusinessId(businessId);
    nextSlide();
  };

  return {
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
  };
};