
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const EmptyBusinessState = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center space-y-4">
      <p className="text-gray-500">No businesses found.</p>
      <Button onClick={() => navigate("/onboarding")}>
        <Plus className="h-4 w-4 mr-2" />
        Create New Business
      </Button>
    </div>
  );
};
