
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseReportGenerationProps {
  businessId?: string;
  onSuccess: () => void;
}

export const useReportGeneration = ({ businessId, onSuccess }: UseReportGenerationProps) => {
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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVisualization({
      showBarCharts: true,
      showLineCharts: true,
      showPieCharts: true,
      showTables: true,
      showTimeline: true,
    });
  };

  const { mutate: createReport, isPending } = useMutation({
    mutationFn: async () => {
      if (!businessId) throw new Error("No business selected");

      const { data: template, error: templateError } = await supabase
        .from("report_templates")
        .insert({
          business_id: businessId,
          name: title,
          description,
          layout_type: "infographic",
          theme_colors: ["#10B981", "#3B82F6", "#8B5CF6"],
          report_type: "combined",
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
          config: {},
          is_active: true
        })
        .select()
        .single();

      if (templateError) throw templateError;

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
      resetForm();
      onSuccess();
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

  return {
    title,
    setTitle,
    description,
    setDescription,
    visualization,
    setVisualization,
    createReport,
    isPending,
  };
};
