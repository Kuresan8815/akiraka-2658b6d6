import { Button } from "@/components/ui/button";
import { QrCode, Gift, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <Button
        onClick={() => navigate("/scan")}
        className="bg-eco-primary hover:bg-eco-secondary"
      >
        <QrCode className="mr-2" />
        Scan QR
      </Button>
      <Button
        variant="outline"
        onClick={() => navigate("/rewards")}
      >
        <Gift className="mr-2" />
        Rewards
      </Button>
      <Button
        variant="outline"
        onClick={() => navigate("/history")}
      >
        <History className="mr-2" />
        History
      </Button>
    </div>
  );
};