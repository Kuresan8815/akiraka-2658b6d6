
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useReportForm } from "./useReportForm";
import { ReportData, getColorPalette, parseReportData, getStatusUpdates } from "../utils/reportDataUtils";

interface UseReportGenerationProps {
  businessId?: string;
  onSuccess: () => void;
}

export const useReportGeneration = ({ businessId, onSuccess }: UseReportGenerationProps) => {
  const formState = useReportForm();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: createReport, isPending } = useMutation({
    mutationFn: async () => {
      if (!businessId) throw new Error("No business selected");

      console.log("Creating report for business:", businessId);
      const colorPalette = getColorPalette(formState.colorScheme);

      // Step 1: Create template
      const { data: template, error: templateError } = await supabase
        .from("report_templates")
        .insert({
          business_id: businessId,
          name: formState.title,
          description: formState.description,
          layout_type: "infographic",
          theme_colors: colorPalette,
          report_type: "combined",
          visualization_config: formState.visualization,
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
            infographicTemplates: formState.visualization.showInfographics ? ["esg_summary", "impact_highlights", "sustainability_journey"] : [],
            includeExecutiveSummary: true,
            headingFont: "Poppins",
            bodyFont: "Inter",
            showLegends: true,
            enableInteractivity: true,
            pageLayout: "modern",
            showDataSources: true,
            useExternalChartProvider: formState.useExternalCharts
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
      
      const initialReportData: ReportData = {
        empty_metrics: formState.handleEmptyMetrics,
        useExternalCharts: formState.useExternalCharts,
        status_updates: ["Created report record"]
      };
      
      const { data: report, error: reportError } = await supabase
        .from("generated_reports")
        .insert({
          business_id: businessId,
          template_id: template.id,
          report_data: initialReportData,
          status: "pending",
          date_range: dateRange,
          metadata: {
            reportType: "comprehensive_esg",
            visualizationPreferences: formState.visualization,
            colorScheme: formState.colorScheme,
            handleEmptyMetrics: formState.handleEmptyMetrics,
            useExternalCharts: formState.useExternalCharts,
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

      return await generateReportWithEdgeFunction(report, businessId, formState, dateRange);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated-reports"] });
      toast({
        title: "Success",
        description: "Report generation started. You'll be notified when it's ready.",
      });
      formState.resetForm();
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
    ...formState,
    createReport,
    isPending,
  };
};

async function generateReportWithEdgeFunction(report: any, businessId: string, formState: ReturnType<typeof useReportForm>, dateRange: { start: string; end: string }) {
  try {
    console.log("Invoking edge function with params:", {
      report_id: report.id,
      business_id: businessId,
      handle_empty_metrics: formState.handleEmptyMetrics,
      use_external_charts: formState.useExternalCharts,
      configuration: {
        title: formState.title,
        description: formState.description,
        visualization: formState.visualization,
        colorScheme: formState.colorScheme,
        date_range: dateRange,
        includeExecutiveSummary: true,
        categorizeByESG: true,
        handleEmptyMetrics: formState.handleEmptyMetrics,
        useExternalCharts: formState.useExternalCharts,
        chartProvider: "quickchart",
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
        handle_empty_metrics: formState.handleEmptyMetrics,
        use_external_charts: formState.useExternalCharts,
        configuration: {
          title: formState.title,
          description: formState.description,
          visualization: formState.visualization,
          colorScheme: formState.colorScheme,
          date_range: dateRange,
          includeExecutiveSummary: true,
          categorizeByESG: true,
          handleEmptyMetrics: formState.handleEmptyMetrics,
          useExternalCharts: formState.useExternalCharts,
          chartProvider: "quickchart",
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
      const reportData = parseReportData(report.report_data);
      const statusUpdates = getStatusUpdates(reportData);
      statusUpdates.push("Edge function failed");
      
      await supabase
        .from("generated_reports")
        .update({ 
          status: "failed", 
          report_data: { 
            ...reportData,
            error: fnError.message,
            empty_metrics: formState.handleEmptyMetrics,
            useExternalCharts: formState.useExternalCharts,
            timestamp: new Date().toISOString(),
            status_updates: statusUpdates
          } 
        })
        .eq("id", report.id);
        
      throw new Error(`Edge function error: ${fnError.message}`);
    }
    
    console.log("Edge function response:", fnResponse);
    
    // Check for PDF URL in the response
    if (fnResponse && fnResponse.pdf_url) {
      // Update the report with the PDF URL
      const reportData = parseReportData(report.report_data);
      const statusUpdates = getStatusUpdates(reportData);
      statusUpdates.push("Report completed with PDF");
      
      const { error: updateError } = await supabase
        .from("generated_reports")
        .update({ 
          pdf_url: fnResponse.pdf_url,
          status: "completed",
          report_data: {
            ...reportData,
            empty_metrics: formState.handleEmptyMetrics,
            useExternalCharts: formState.useExternalCharts,
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
      const reportData = parseReportData(report.report_data);
      const statusUpdates = getStatusUpdates(reportData);
      statusUpdates.push("Completed but missing PDF URL");
      
      await supabase
        .from("generated_reports")
        .update({ 
          status: "completed",
          report_data: {
            ...reportData,
            empty_metrics: formState.handleEmptyMetrics,
            useExternalCharts: formState.useExternalCharts,
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
    const reportData = parseReportData(report.report_data);
    const statusUpdates = getStatusUpdates(reportData);
    statusUpdates.push("Edge function invoke error");
    
    await supabase
      .from("generated_reports")
      .update({ 
        status: "failed", 
        report_data: { 
          ...reportData,
          error: fnInvokeError.message || "Unknown error",
          empty_metrics: formState.handleEmptyMetrics,
          useExternalCharts: formState.useExternalCharts,
          timestamp: new Date().toISOString(),
          status_updates: statusUpdates
        } 
      })
      .eq("id", report.id);
      
    throw new Error(`Failed to start report generation process: ${fnInvokeError.message}`);
  }
}
