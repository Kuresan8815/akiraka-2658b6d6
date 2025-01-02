import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  onRetry: () => void;
}

export const ErrorState = ({ onRetry }: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h3 className="text-lg font-semibold">Unable to load history</h3>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  );
};