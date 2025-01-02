import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ScanListHeaderProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const ScanListHeader = ({ onRefresh, isRefreshing }: ScanListHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold text-eco-primary">Recent Scans</h3>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onRefresh}
        disabled={isRefreshing}
        className="text-eco-primary hover:text-eco-primary/80"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );
};