
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export const EmptyMetricsBadge = () => {
  return (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
      <AlertTriangle className="h-3 w-3" />
      Empty Metrics
    </Badge>
  );
};
