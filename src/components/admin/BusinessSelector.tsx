import { useNavigate } from "react-router-dom";
import { useBusinessSelection } from "@/hooks/useBusinessSelection";
import { BusinessSelectUI } from "./BusinessSelectUI";

export const BusinessSelector = () => {
  const navigate = useNavigate();
  const { businesses, selectedBusiness, handleBusinessChange } = useBusinessSelection();

  const handleSelection = (businessId: string) => {
    if (businessId === "new") {
      navigate("/onboarding");
      return;
    }
    handleBusinessChange(businessId);
  };

  return (
    <BusinessSelectUI
      businesses={businesses}
      selectedBusiness={selectedBusiness}
      onBusinessChange={handleSelection}
    />
  );
};