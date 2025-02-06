
import { useNavigate } from "react-router-dom";
import { useBusinessSelection } from "@/hooks/useBusinessSelection";
import { BusinessSelectUI } from "./BusinessSelectUI";
import { BusinessSelectorSkeleton } from "./business-selector/BusinessSelectorSkeleton";
import { EmptyBusinessState } from "./business-selector/EmptyBusinessState";

export const BusinessSelector = () => {
  const navigate = useNavigate();
  const { businesses, selectedBusiness, handleBusinessChange, isLoading } = useBusinessSelection();

  const handleSelection = (businessId: string) => {
    if (businessId === "new") {
      navigate("/onboarding");
      return;
    }
    handleBusinessChange(businessId);
  };

  if (isLoading) {
    return <BusinessSelectorSkeleton />;
  }

  if (!businesses.length) {
    return <EmptyBusinessState />;
  }

  return (
    <BusinessSelectUI
      businesses={businesses}
      selectedBusiness={selectedBusiness}
      onBusinessChange={handleSelection}
    />
  );
};
