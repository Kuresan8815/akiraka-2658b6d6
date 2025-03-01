
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ReportErrorMessageProps {
  error: Error | unknown;
}

export const ReportErrorMessage = ({ error }: ReportErrorMessageProps) => {
  return (
    <Card className="bg-red-50">
      <CardContent className="pt-6">
        <div className="text-center space-y-2">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <CardTitle>Error Loading Reports</CardTitle>
          <CardDescription className="text-red-600">
            {error instanceof Error ? error.message : "Failed to load reports"}
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  );
};
