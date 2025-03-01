
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GeneratedReport } from "@/types/reports";
import { toast } from "@/hooks/use-toast";
import { parseReportData } from "./utils/reportDataUtils";
import { ReportErrorMessage } from "./components/ReportErrorMessage";
import { ReportsLoading } from "./components/ReportsLoading";
import { EmptyReportsState } from "./components/EmptyReportsState";
import { ReportCard } from "./components/ReportCard";

interface GeneratedReportsProps {
  businessId?: string;
}

export const GeneratedReports = ({ businessId }: GeneratedReportsProps) => {
  const { data: reports, isLoading, error } = useQuery({
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
      // Check if URL has proper protocol and is not just "example.com" or similar
      return (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') && 
             !parsedUrl.hostname.includes('example.com') &&
             parsedUrl.pathname.length > 1;
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

    if (!isPdfUrlValid(report.pdf_url)) {
      toast({
        title: "Invalid PDF URL",
        description: "The PDF URL appears to be invalid or incomplete. Please regenerate the report.",
        variant: "destructive",
      });
      return;
    }

    console.log("Attempting to download PDF from:", report.pdf_url);
    
    try {
      window.open(report.pdf_url, '_blank');
      
      const reportData = parseReportData(report.report_data);
      const updatedReportData = {
        ...reportData,
        last_download_attempt: new Date().toISOString()
      };
      
      supabase
        .from("generated_reports")
        .update({ 
          report_data: updatedReportData
        })
        .eq("id", report.id)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating report download timestamp:", error);
          }
        });
      
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Download Error",
        description: "There was an error downloading the file. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleRetry = async (report: GeneratedReport & { report_template: any }) => {
    try {
      const { error } = await supabase
        .from("generated_reports")
        .update({ 
          status: "pending", 
          report_data: {
            ...report.report_data,
            retry_timestamp: new Date().toISOString(),
            retry_count: (report.report_data.retry_count || 0) + 1,
            empty_data_handling: true
          }
        })
        .eq("id", report.id);
      
      if (error) throw error;
      
      const { data: fnResponse, error: fnError } = await supabase.functions.invoke('generate-esg-report', {
        body: { 
          report_id: report.id,
          business_id: businessId,
          retry: true,
          handle_empty_metrics: true
        }
      });
      
      if (fnError) throw fnError;
      
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
        />
      ))}
    </div>
  );
};
