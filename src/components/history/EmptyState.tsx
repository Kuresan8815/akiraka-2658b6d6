import { AlertCircle } from "lucide-react";

interface EmptyStateProps {
  dateRange: any;
}

export const EmptyState = ({ dateRange }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
      <AlertCircle className="h-12 w-12 text-muted-foreground" />
      <h3 className="text-lg font-semibold">No scans found</h3>
      <p className="text-muted-foreground">
        {dateRange?.from || dateRange?.to
          ? "No scans found for the selected dates. Try adjusting your filter."
          : "Start scanning products to build your history!"}
      </p>
    </div>
  );
};