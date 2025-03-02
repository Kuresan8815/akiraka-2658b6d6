
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Loader2, RotateCw } from "lucide-react";
import { GeneratedReport } from "@/types/reports";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ReportActionsProps {
  report: GeneratedReport & { report_template: any };
  onDownload: (report: GeneratedReport & { report_template: any }) => void;
  onRetry: (report: GeneratedReport & { report_template: any }) => void;
}

export const ReportActions = ({ report, onDownload, onRetry }: ReportActionsProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const isPdfUrlValid = (url: string | null) => {
    if (!url) return false;
    
    try {
      const parsedUrl = new URL(url);
      // Check if URL has proper protocol and is not just "example.com" or similar
      return (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') && 
             !parsedUrl.hostname.includes('example.com') &&
             parsedUrl.pathname.length > 1 &&
             parsedUrl.pathname.includes('storage/v1/object/public/reports/');
    } catch (e) {
      return false;
    }
  };

  const handleOpenPdf = () => {
    if (!report.pdf_url || !isPdfUrlValid(report.pdf_url)) {
      toast({
        title: "Invalid PDF URL",
        description: "The PDF URL appears to be invalid. Please try regenerating the report.",
        variant: "destructive",
      });
      return;
    }
    
    window.open(report.pdf_url, '_blank');
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (!isPdfUrlValid(report.pdf_url)) {
        // Try to download via edge function for better error handling
        const { data: response, error } = await supabase.functions.invoke('download-report', {
          body: { reportId: report.id }
        });
        
        if (error) {
          throw new Error(`Edge function error: ${error.message}`);
        }
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        // If the function returned a download URL, open it
        if (response.downloadUrl) {
          window.open(response.downloadUrl, '_blank');
        } else {
          // Call the original download handler as fallback
          await onDownload(report);
        }
      } else {
        // If URL seems valid, try the normal download
        await onDownload(report);
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the report. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Determine if retry should be enabled
  const shouldShowRetry = 
    report.status === 'failed' || 
    (report.status === 'completed' && report.page_count === 0) || 
    (report.status === 'completed' && !report.pdf_url) || 
    (report.status === 'completed' && report.pdf_url && !isPdfUrlValid(report.pdf_url));

  // Get retry count for better UI feedback
  const retryCount = report.report_data?.retry_count || 0;

  return (
    <div className="flex items-center gap-2">
      {report.status === 'completed' && report.pdf_url && isPdfUrlValid(report.pdf_url) && (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
            className="flex items-center gap-2"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isDownloading ? "Downloading..." : "Download PDF"}
            {report.file_size && (
              <span className="ml-2 text-xs text-gray-500">
                ({Math.round(report.file_size / 1024)}KB)
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenPdf}
            title="Open PDF directly in browser"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </>
      )}
      
      {report.status === 'processing' && (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      )}
      
      {shouldShowRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onRetry(report)}
          className="gap-2"
          disabled={report.status === 'pending'}
        >
          <RotateCw className="h-4 w-4" />
          {retryCount > 0 ? `Retry Again (${retryCount})` : "Retry with Empty Metrics"}
        </Button>
      )}
      
      {report.status === 'pending' && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </div>
      )}
    </div>
  );
};
