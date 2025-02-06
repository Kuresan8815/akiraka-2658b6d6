
import { useNavigate } from "react-router-dom";
import { useBusinessSelection } from "@/hooks/useBusinessSelection";
import { BusinessSelectUI } from "./BusinessSelectUI";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

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
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!businesses.length) {
    return (
      <div className="text-center space-y-4">
        <p className="text-gray-500">No businesses found.</p>
        <Button onClick={() => navigate("/onboarding")}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Business
        </Button>
      </div>
    );
  }

  return (
    <BusinessSelectUI
      businesses={businesses}
      selectedBusiness={selectedBusiness}
      onBusinessChange={handleSelection}
    />
  );
};
