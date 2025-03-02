
import { Button } from "@/components/ui/button";
import { PlusCircle, FileBarChart } from "lucide-react";
import { useState } from "react";
import { CreateReportDialog } from "../CreateReportDialog";

export const EmptyReportsState = ({ business_id }: { business_id?: string }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="flex items-center justify-center w-20 h-20 mb-6 bg-gray-100 rounded-full">
        <FileBarChart className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">No reports yet</h3>
      <p className="mb-6 text-gray-500 max-w-md">
        Create your first report to analyze your sustainability data and track your ESG performance.
      </p>
      <Button onClick={() => setIsDialogOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create New Report
      </Button>

      <CreateReportDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        businessId={business_id}
        onSuccess={() => setIsDialogOpen(false)}
      />
    </div>
  );
};
