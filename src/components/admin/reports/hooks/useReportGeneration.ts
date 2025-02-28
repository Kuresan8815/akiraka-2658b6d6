
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
    showWaterfall: true,
    showHeatmaps: true,
    showInfographics: true,
  });
  
  const [colorScheme, setColorScheme] = useState("greenBlue");

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
      showWaterfall: true,
      showHeatmaps: true,
      showInfographics: true,
    });
    setColorScheme("greenBlue");
  };

  const getColorPalette = (scheme: string) => {
    const palettes = {
      greenBlue: ["#10B981", "#3B82F6", "#8B5CF6"],
      vibrant: ["#F59E0B", "#10B981", "#3B82F6", "#EC4899"],
      earthy: ["#D97706", "#65A30D", "#0369A1", "#A16207"],
      contrast: ["#10B981", "#EC4899", "#F59E0B", "#8B5CF6"],
      rainbow: ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"]
    };
    return palettes[scheme as keyof typeof palettes] || palettes.greenBlue;
  };

  const { mutate: createReport, isPending } = useMutation({
    mutationFn: async () => {
      if (!businessId) throw new Error("No business selected");

      const colorPalette = getColorPalette(colorScheme);

      const { data: template, error: templateError } = await supabase
        .from("report_templates")
        .insert({
          business_id: businessId,
          name: title,
          description,
          layout_type: "infographic",
          theme_colors: colorPalette,
          report_type: "combined",
          visualization_config: visualization,
          charts_config: [
            {
              type: "line",
              metric: "environmental_impact",
              title: "Environmental Impact Trend",
              colors: colorPalette.slice(0, 2)
            },
            {
              type: "bar",
              metric: "social_metrics",
              title: "Social Impact Metrics",
              colors: colorPalette.slice(1, 3)
            },
            {
              type: "pie",
              metric: "governance_distribution",
              title: "Governance Score Distribution",
              colors: colorPalette
            },
            {
              type: "area",
              metric: "water_consumption",
              title: "Water Consumption Over Time",
              colors: [colorPalette[0]]
            },
            {
              type: "radar",
              metric: "sustainability_dimensions",
              title: "Sustainability Dimensions",
              colors: [colorPalette[1]]
            },
            {
              type: "waterfall",
              metric: "carbon_footprint_changes",
              title: "Carbon Footprint Changes",
              colors: colorPalette
            }
          ],
          config: {
            infographicTemplates: visualization.showInfographics ? ["esg_summary", "impact_highlights", "sustainability_journey"] : [],
            includeExecutiveSummary: true,
            headingFont: "Poppins",
            bodyFont: "Inter",
            showLegends: true,
            enableInteractivity: true,
            pageLayout: "modern",
            showDataSources: true
          },
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
            visualizationPreferences: visualization,
            colorScheme: colorScheme,
            infographicOptions: {
              showIcons: true,
              useAnimations: true,
              highlightKeyFindings: true,
              includeExecutiveSummary: true
            }
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
            colorScheme,
            includeExecutiveSummary: true,
            categorizeByESG: true,
            infographicOptions: {
              showIcons: true,
              useAnimations: true,
              highlightKeyFindings: true
            }
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
    colorScheme,
    setColorScheme,
    createReport,
    isPending,
  };
};
