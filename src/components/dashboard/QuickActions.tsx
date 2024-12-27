import { Button } from "@/components/ui/button";
import { QrCode, Gift, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <Button
        onClick={() => navigate("/scan")}
        className="flex flex-col items-center justify-center h-24 bg-eco-primary hover:bg-eco-secondary transition-colors"
      >
        <QrCode className="h-6 w-6 mb-2" />
        <span className="text-xs">Scan QR</span>
      </Button>
      <Button
        variant="outline"
        onClick={() => navigate("/rewards")}
        className="flex flex-col items-center justify-center h-24 border-eco-primary text-eco-primary hover:bg-eco-primary hover:text-white transition-colors"
      >
        <Gift className="h-6 w-6 mb-2" />
        <span className="text-xs">Rewards</span>
      </Button>
      <Button
        variant="outline"
        onClick={() => navigate("/history")}
        className="flex flex-col items-center justify-center h-24 border-eco-primary text-eco-primary hover:bg-eco-primary hover:text-white transition-colors"
      >
        <History className="h-6 w-6 mb-2" />
        <span className="text-xs">History</span>
      </Button>
    </div>
  );
};