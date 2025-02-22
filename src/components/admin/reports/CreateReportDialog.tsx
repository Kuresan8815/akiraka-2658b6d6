
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ReportTemplate } from "@/types/reports";

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visualization, setVisualization] = useState({
    showBarCharts: true,
    showLineCharts: true,
    showPieCharts: true,
    showTables: true,
    showTimeline: true,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: createReport, isPending } = useMutation({
    mutationFn: async () => {
      if (!businessId) throw new Error("No business selected");

      // Create a report template with ESG focus
      const { data: template, error: templateError } = await supabase
        .from("report_templates")
        .insert({
          business_id: businessId,
          name: title,
          description,
          layout_type: "infographic",
          theme_colors: ["#10B981", "#3B82F6", "#8B5CF6"],
          report_type: "combined", // Using 'combined' instead of 'esg'
          visualization_config: visualization,
          charts_config: [
            {
              type: "line",
              metric: "environmental_impact",
              title: "Environmental Impact Trend"
            },
            {
              type: "bar",
              metric: "social_metrics",
              title: "Social Impact Metrics"
            },
            {
              type: "pie",
              metric: "governance_distribution",
              title: "Governance Score Distribution"
            }
          ],
          config: {}, // Required field
          is_active: true
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Generate the report
      const { data: report, error: reportError } = await supabase
        .from("generated_reports")
        .insert({
          business_id: businessId,
          template_id: template.id,
          report_data: {},
          status: "pending",
          date_range: {
            start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
            end: new Date().toISOString(),
          },
          metadata: {
            reportType: "comprehensive_esg",
            visualizationPreferences: visualization
          }
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Trigger the report generation
      const { error: fnError } = await supabase.functions.invoke('generate-esg-report', {
        body: { 
          report_id: report.id,
          business_id: businessId,
          configuration: {
            title,
            description,
            visualization,
            includeExecutiveSummary: true,
            categorizeByESG: true
          }
        }
      });

      if (fnError) throw fnError;
      return report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated-reports"] });
      toast({
        title: "Success",
        description: "Report generation started. You'll be notified when it's ready.",
      });
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setVisualization({
        showBarCharts: true,
        showLineCharts: true,
        showPieCharts: true,
        showTables: true,
        showTimeline: true,
      });
    },
    onError: (error) => {
      console.error("Report creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create report: " + error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate ESG Performance Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Report Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Q1 2024 ESG Performance Report"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Report Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Comprehensive analysis of our ESG metrics and sustainability impact..."
            />
          </div>
          <div className="space-y-2">
            <Label>Visualization Options</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showBarCharts"
                  checked={visualization.showBarCharts}
                  onCheckedChange={(checked) =>
                    setVisualization((prev) => ({ ...prev, showBarCharts: checked as boolean }))
                  }
                />
                <Label htmlFor="showBarCharts">Bar Charts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showLineCharts"
                  checked={visualization.showLineCharts}
                  onCheckedChange={(checked) =>
                    setVisualization((prev) => ({ ...prev, showLineCharts: checked as boolean }))
                  }
                />
                <Label htmlFor="showLineCharts">Line Charts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showPieCharts"
                  checked={visualization.showPieCharts}
                  onCheckedChange={(checked) =>
                    setVisualization((prev) => ({ ...prev, showPieCharts: checked as boolean }))
                  }
                />
                <Label htmlFor="showPieCharts">Pie Charts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showTables"
                  checked={visualization.showTables}
                  onCheckedChange={(checked) =>
                    setVisualization((prev) => ({ ...prev, showTables: checked as boolean }))
                  }
                />
                <Label htmlFor="showTables">Data Tables</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showTimeline"
                  checked={visualization.showTimeline}
                  onCheckedChange={(checked) =>
                    setVisualization((prev) => ({ ...prev, showTimeline: checked as boolean }))
                  }
                />
                <Label htmlFor="showTimeline">Timeline View</Label>
              </div>
            </div>
          </div>
        </div>
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
