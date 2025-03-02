import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GeneratedReport } from "@/types/reports";
import { toast } from "@/hooks/use-toast";
import { parseReportData } from "./utils/reportDataUtils";
import { ReportErrorMessage } from "./components/ReportErrorMessage";
import { ReportsLoading } from "./components/ReportsLoading";
import { EmptyReportsState } from "./components/EmptyReportsState";
import { ReportCard } from "./components/ReportCard";
import { useState } from "react";

interface GeneratedReportsProps {
  businessId?: string;
}

export const GeneratedReports = ({ businessId }: GeneratedReportsProps) => {
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);
  
  const { data: reports, isLoading, error, refetch } = useQuery({
    queryKey: ["generated-reports", businessId],
    enabled: !!businessId,
    refetchInterval: 5000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_reports")
        .select(`
          *,
          report_template:report_templates(*)
        `)
        .eq("business_id", businessId)
        .order("generated_at", { ascending: false });

      if (error) throw error;
      
      console.log("Reports fetched:", data);
      
      return (data as any[]).map(report => ({
        ...report,
        date_range: report.date_range ? {
          start: report.date_range.start,
          end: report.date_range.end
        } : null
      })) as (GeneratedReport & { report_template: any })[];
    },
  });

  const isPdfUrlValid = (url: string | null) => {
    if (!url) return false;
    
    try {
      const parsedUrl = new URL(url);
      return (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') && 
             !parsedUrl.hostname.includes('example.com') &&
             parsedUrl.pathname.length > 1 &&
             parsedUrl.pathname.includes('storage/v1/object/public/reports/');
    } catch (e) {
      return false;
    }
  };

  const handleDownload = async (report: GeneratedReport & { report_template: any }) => {
    if (!report.pdf_url) {
      toast({
        title: "Error",
        description: "PDF URL is missing. Please regenerate the report.",
        variant: "destructive",
      });
      return;
    }

    setDownloadingReportId(report.id);
    console.log("Attempting to download PDF from:", report.pdf_url);
    
    try {
      // First try to use the download-report edge function for better error handling
      const { data: response, error: fnError } = await supabase.functions.invoke('download-report', {
        body: { reportId: report.id }
      });
      
      if (fnError) {
        console.error("Edge function error:", fnError);
        
        // Fall back to direct download if edge function fails
        if (isPdfUrlValid(report.pdf_url)) {
          window.open(report.pdf_url, '_blank');
        } else {
          throw new Error("Invalid PDF URL and edge function failed");
        }
      } else if (response.error) {
        throw new Error(response.error);
      } else {
        // Edge function worked, update report data if needed
        const reportData = parseReportData(report.report_data);
        const updatedReportData = {
          ...reportData,
          last_download_attempt: new Date().toISOString(),
          download_success: true
        };
        
        await supabase
          .from("generated_reports")
          .update({ 
            report_data: updatedReportData
          })
          .eq("id", report.id);
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Download Error",
        description: "The PDF file could not be found or accessed. Please regenerate the report.",
        variant: "destructive",
      });
      
      // Update report data to reflect download failure
      const reportData = parseReportData(report.report_data);
      await supabase
        .from("generated_reports")
        .update({ 
          report_data: {
            ...reportData,
            last_download_attempt: new Date().toISOString(),
            download_success: false,
            download_error: error instanceof Error ? error.message : "Unknown error"
          }
        })
        .eq("id", report.id);
    } finally {
      setDownloadingReportId(null);
    }
  };

  const handleRetry = async (report: GeneratedReport & { report_template: any }) => {
    try {
      toast({
        title: "Regenerating Report",
        description: "Starting report regeneration with empty metrics handling...",
      });
      
      // First update the report status to pending and add details
      const { error: updateError } = await supabase
        .from("generated_reports")
        .update({ 
          status: "pending", 
          report_data: {
            ...parseReportData(report.report_data),
            retry_timestamp: new Date().toISOString(),
            retry_count: (report.report_data?.retry_count || 0) + 1,
            empty_metrics: true,
            force_regenerate: true,
            status_updates: [...(report.report_data?.status_updates || []), 
              `Manual retry initiated at ${new Date().toISOString()}`]
          }
        })
        .eq("id", report.id);
      
      if (updateError) throw updateError;
      
      console.log("Invoking edge function with retry params for report:", report.id);
      
      // Call the edge function with specific params to handle the retry
      const { data: fnResponse, error: fnError } = await supabase.functions.invoke('generate-esg-report', {
        body: { 
          report_id: report.id,
          business_id: businessId,
          retry: true,
          handle_empty_metrics: true,
          force_regenerate: true,
          configuration: {
            ...(report.metadata || {}),
            handleEmptyMetrics: true,
            useExternalCharts: true,
            retry_context: {
              retry_reason: "manual_retry",
              previous_status: report.status,
              had_pdf_url: !!report.pdf_url,
              had_valid_pdf: isPdfUrlValid(report.pdf_url)
            }
          }
        }
      });
      
      if (fnError) throw fnError;
      
      console.log("Edge function response:", fnResponse);
      
      // Trigger a refetch to get the updated report status
      refetch();
      
      toast({
        title: "Report Regeneration Started",
        description: "Your report is being regenerated with empty metrics handling. This may take a few moments.",
      });
      
    } catch (error: any) {
      console.error("Error retrying report generation:", error);
      toast({
        title: "Error",
        description: `Failed to retry report generation: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  if (error) {
    return <ReportErrorMessage error={error} />;
  }

  if (isLoading) {
    return <ReportsLoading />;
  }

  if (!reports?.length) {
    return <EmptyReportsState />;
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <ReportCard 
          key={report.id}
          report={report}
          onDownload={handleDownload}
          onRetry={handleRetry}
          isDownloading={downloadingReportId === report.id}
        />
      ))}
    </div>
  );
};
