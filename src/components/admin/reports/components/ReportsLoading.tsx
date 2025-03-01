
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const ReportsLoading = () => {
  return (
    <Card className="bg-gray-50">
      <CardContent className="pt-6">
        <div className="text-center space-y-2">
          <Loader2 className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
          <CardTitle>Loading reports...</CardTitle>
        </div>
      </CardContent>
    </Card>
  );
};
