
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Loader2, RotateCw } from "lucide-react";
import { GeneratedReport } from "@/types/reports";

interface ReportActionsProps {
  report: GeneratedReport & { report_template: any };
  onDownload: (report: GeneratedReport & { report_template: any }) => void;
  onRetry: (report: GeneratedReport & { report_template: any }) => void;
}

export const ReportActions = ({ report, onDownload, onRetry }: ReportActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      {report.status === 'completed' && report.pdf_url && (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDownload(report)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
            {report.file_size && (
              <span className="ml-2 text-xs text-gray-500">
                ({Math.round(report.file_size / 1024)}KB)
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(report.pdf_url, '_blank')}
            title="Open PDF directly in browser"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </>
      )}
      
      {report.status === 'processing' && (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      )}
      
      {(report.status === 'failed' || 
        (report.status === 'completed' && report.page_count === 0) || 
        (report.status === 'completed' && !report.pdf_url)) && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onRetry(report)}
          className="gap-2"
        >
          <RotateCw className="h-4 w-4" />
          Retry with Empty Metrics
        </Button>
      )}
    </div>
  );
};
