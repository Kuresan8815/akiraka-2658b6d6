
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReportForm } from "./components/ReportForm";
import { useReportGeneration } from "./hooks/useReportGeneration";

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId?: string;
}

export const CreateReportDialog = ({
  open,
  onOpenChange,
  businessId,
}: CreateReportDialogProps) => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    visualization,
    setVisualization,
    createReport,
    isPending,
  } = useReportGeneration({
    businessId,
    onSuccess: () => onOpenChange(false),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate ESG Performance Report</DialogTitle>
        </DialogHeader>
        <ReportForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          visualization={visualization}
          setVisualization={setVisualization}
        />
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createReport()}
            disabled={!title || isPending}
          >
            {isPending ? "Generating..." : "Generate Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
