
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
  const [handleEmptyMetrics, setHandleEmptyMetrics] = useState(true);
  const [useExternalCharts, setUseExternalCharts] = useState(true); // New state for external chart API

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
    setHandleEmptyMetrics(true);
    setUseExternalCharts(true);
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

      console.log("Creating report for business:", businessId);
      const colorPalette = getColorPalette(colorScheme);

      // Step 1: Create template
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
            showDataSources: true,
            useExternalChartProvider: useExternalCharts // Add the new configuration
          },
          is_active: true
        })
        .select()
        .single();

      if (templateError) {
        console.error("Template creation error:", templateError);
        throw templateError;
      }

      console.log("Template created successfully:", template);

      // Step 2: Create report record
      const dateRange = {
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        end: new Date().toISOString(),
      };
      
      const { data: report, error: reportError } = await supabase
        .from("generated_reports")
        .insert({
          business_id: businessId,
          template_id: template.id,
          report_data: {
            empty_metrics: handleEmptyMetrics,
            useExternalCharts: useExternalCharts, // Add the new flag
            status_updates: ["Created report record"]
          },
          status: "pending",
          date_range: dateRange,
          metadata: {
            reportType: "comprehensive_esg",
            visualizationPreferences: visualization,
            colorScheme: colorScheme,
            handleEmptyMetrics: handleEmptyMetrics,
            useExternalCharts: useExternalCharts, // Add to metadata as well
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

      if (reportError) {
        console.error("Report creation error:", reportError);
        throw reportError;
      }

      console.log("Report record created successfully:", report);

      // Step 3: Invoke edge function to generate the report
      try {
        console.log("Invoking edge function with params:", {
          report_id: report.id,
          business_id: businessId,
          handle_empty_metrics: handleEmptyMetrics,
          use_external_charts: useExternalCharts, // Add new parameter
          configuration: {
            title,
            description,
            visualization,
            colorScheme,
            date_range: dateRange,
            includeExecutiveSummary: true,
            categorizeByESG: true,
            handleEmptyMetrics: handleEmptyMetrics,
            useExternalCharts: useExternalCharts, // Add to configuration
            chartProvider: "quickchart", // Specify which chart provider to use
            infographicOptions: {
              showIcons: true,
              useAnimations: true,
              highlightKeyFindings: true
            }
          }
        });
        
        const { data: fnResponse, error: fnError } = await supabase.functions.invoke('generate-esg-report', {
          body: { 
            report_id: report.id,
            business_id: businessId,
            handle_empty_metrics: handleEmptyMetrics,
            use_external_charts: useExternalCharts, // Add the flag to the edge function
            configuration: {
              title,
              description,
              visualization,
              colorScheme,
              date_range: dateRange,
              includeExecutiveSummary: true,
              categorizeByESG: true,
              handleEmptyMetrics: handleEmptyMetrics,
              useExternalCharts: useExternalCharts, // Add flag to configuration
              chartProvider: "quickchart", // Specify which chart provider to use
              infographicOptions: {
                showIcons: true,
                useAnimations: true,
                highlightKeyFindings: true
              }
            }
          }
        });

        if (fnError) {
          console.error("Edge function error:", fnError);
          
          // Update report status to failed
          await supabase
            .from("generated_reports")
            .update({ 
              status: "failed", 
              report_data: { 
                error: fnError.message,
                empty_metrics: handleEmptyMetrics,
                useExternalCharts: useExternalCharts,
                timestamp: new Date().toISOString(),
                status_updates: ["Created report record", "Edge function failed"]
              } 
            })
            .eq("id", report.id);
            
          throw new Error(`Edge function error: ${fnError.message}`);
        }
        
        console.log("Edge function response:", fnResponse);
        
        // Check for PDF URL in the response
        if (fnResponse && fnResponse.pdf_url) {
          // Update the report with the PDF URL
          const reportData = typeof report.report_data === 'object' ? report.report_data : {};
          const statusUpdates = Array.isArray(reportData.status_updates) ? 
            [...reportData.status_updates, "Report completed with PDF"] : 
            ["Created report record", "Report completed with PDF"];
          
          const { error: updateError } = await supabase
            .from("generated_reports")
            .update({ 
              pdf_url: fnResponse.pdf_url,
              status: "completed",
              report_data: {
                ...reportData,
                empty_metrics: handleEmptyMetrics,
                useExternalCharts: useExternalCharts,
                status_updates: statusUpdates
              }
            })
            .eq("id", report.id);
            
          if (updateError) {
            console.error("Error updating report with PDF URL:", updateError);
          }
        } else {
          console.warn("PDF URL missing in function response:", fnResponse);
          
          // Update the report with a warning about missing PDF URL
          const reportData = typeof report.report_data === 'object' ? report.report_data : {};
          const statusUpdates = Array.isArray(reportData.status_updates) ? 
            [...reportData.status_updates, "Completed but missing PDF URL"] : 
            ["Created report record", "Completed but missing PDF URL"];
          
          await supabase
            .from("generated_reports")
            .update({ 
              status: "completed",
              report_data: {
                ...reportData,
                empty_metrics: handleEmptyMetrics,
                useExternalCharts: useExternalCharts,
                warning: "PDF URL missing in edge function response",
                status_updates: statusUpdates
              }
            })
            .eq("id", report.id);
        }
        
        return report;
      } catch (fnInvokeError: any) {
        console.error("Error invoking edge function:", fnInvokeError);
        
        // More detailed error logging
        if (fnInvokeError.response) {
          try {
            const errorBody = await fnInvokeError.response.json();
            console.error("Edge function response body:", errorBody);
          } catch (e) {
            console.error("Couldn't parse edge function error response");
          }
        }
        
        // Update report status to failed
        const reportData = typeof report.report_data === 'object' ? report.report_data : {};
        const statusUpdates = Array.isArray(reportData.status_updates) ? 
          [...reportData.status_updates, "Edge function invoke error"] : 
          ["Created report record", "Edge function invoke error"];
        
        await supabase
          .from("generated_reports")
          .update({ 
            status: "failed", 
            report_data: { 
              error: fnInvokeError.message || "Unknown error",
              empty_metrics: handleEmptyMetrics,
              useExternalCharts: useExternalCharts,
              timestamp: new Date().toISOString(),
              status_updates: statusUpdates
            } 
          })
          .eq("id", report.id);
          
        throw new Error(`Failed to start report generation process: ${fnInvokeError.message}`);
      }
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
    onError: (error: any) => {
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
    handleEmptyMetrics,
    setHandleEmptyMetrics,
    useExternalCharts,
    setUseExternalCharts,
    createReport,
    isPending,
  };
};
