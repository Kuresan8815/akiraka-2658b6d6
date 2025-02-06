
import { useNavigate } from "react-router-dom";
import { useBusinessSelection } from "@/hooks/useBusinessSelection";
import { BusinessSelectUI } from "./BusinessSelectUI";
import { BusinessSelectorSkeleton } from "./business-selector/BusinessSelectorSkeleton";
import { EmptyBusinessState } from "./business-selector/EmptyBusinessState";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

export const BusinessSelector = () => {
  const navigate = useNavigate();
  const { businesses, selectedBusiness, handleBusinessChange, isLoading } = useBusinessSelection();
  const [error, setError] = useState<string | null>(null);

  const handleSelection = async (businessId: string) => {
    try {
      setError(null);
      if (businessId === "new") {
        navigate("/onboarding");
        return;
      }
      await handleBusinessChange(businessId);
    } catch (err) {
      setError("Failed to switch business. Please try again.");
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

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
