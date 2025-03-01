
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const EmptyReportsState = () => {
  return (
    <Card className="bg-gray-50">
      <CardContent className="pt-6">
        <div className="text-center space-y-2">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <CardTitle>No generated reports</CardTitle>
          <CardDescription>
            Generate a report from one of your templates to see it here
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  );
};
