import { useState } from "react";

export const useOnboardingState = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [createdBusinessId, setCreatedBusinessId] = useState<string>("");

  return {
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
  };
};