
import { format } from "date-fns";
import { AlertTriangle, BarChart3, PieChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedReport } from "@/types/reports";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { EmptyMetricsBadge } from "./EmptyMetricsBadge";
import { ReportActions } from "./ReportActions";
import { ReportDebugInfo } from "./ReportDebugInfo";

interface ReportCardProps {
  report: GeneratedReport & { report_template: any };
  onDownload: (report: GeneratedReport & { report_template: any }) => void;
  onRetry: (report: GeneratedReport & { report_template: any }) => void;
  isDownloading?: boolean;
}

export const ReportCard = ({ report, onDownload, onRetry, isDownloading = false }: ReportCardProps) => {
  const isPdfUrlValid = (url: string | null) => {
    if (!url) return false;
    
    try {
      const parsedUrl = new URL(url);
      return (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') && 
             !parsedUrl.hostname.includes('example.com') &&
             parsedUrl.pathname.length > 1;
    } catch (e) {
      return false;
    }
  };

  return (
    <Card key={report.id} className={report.status === 'failed' ? 'border-red-300 bg-red-50' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              Report #{report.id.slice(0, 8)}
              <ReportStatusBadge status={report.status} />
              {report.report_data?.empty_metrics && <EmptyMetricsBadge />}
            </CardTitle>
            <CardDescription>
              Generated on {format(new Date(report.generated_at), "PPP")}
            </CardDescription>
            {report.report_template && (
              <div className="text-sm text-muted-foreground">
                Template: {report.report_template.name} ({report.report_template.report_type})
              </div>
            )}
          </div>
          
          <ReportActions report={report} onDownload={onDownload} onRetry={onRetry} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2">
          <div className="text-gray-500">
            Date Range: {report.date_range ? (
              <span>
                {format(new Date(report.date_range.start), "PP")} -{" "}
                {format(new Date(report.date_range.end), "PP")}
              </span>
            ) : (
              "All Time"
            )}
          </div>
          {report.page_count ? (
            <div className="text-gray-500">
              Pages: {report.page_count}
            </div>
          ) : report.status === 'completed' ? (
            <div className="text-amber-600">
              Warning: Report has 0 pages
            </div>
          ) : null}
          {report.report_template?.visualization_config && (
            <div className="flex gap-2 mt-2">
              {report.report_template.visualization_config.showBarCharts && (
                <BarChart3 className="h-4 w-4 text-gray-400" />
              )}
              {report.report_template.visualization_config.showPieCharts && (
                <PieChart className="h-4 w-4 text-gray-400" />
              )}
            </div>
          )}
          
          {report.status === 'failed' && report.report_data?.error && (
            <div className="mt-2 p-2 bg-red-50 text-red-700 rounded text-xs">
              Error: {report.report_data.error}
            </div>
          )}
          
          {report.report_data?.empty_metrics && (
            <div className="mt-2 p-2 bg-amber-50 text-amber-700 rounded text-xs">
              This report contains empty metrics. The report will show the metric structure but may not have data values.
            </div>
          )}
          
          {report.status === 'completed' && report.pdf_url && (
            <div className="mt-2 text-xs text-gray-500 break-all">
              <span className="font-semibold">PDF URL:</span> {report.pdf_url}
              {!isPdfUrlValid(report.pdf_url) && (
                <div className="text-red-500 mt-1">
                  <AlertTriangle className="h-3 w-3 inline-block mr-1" />
                  This PDF URL appears to be invalid. You may need to regenerate the report.
                </div>
              )}
              {report.report_data?.download_error && (
                <div className="text-red-500 mt-1">
                  <AlertTriangle className="h-3 w-3 inline-block mr-1" />
                  Last download attempt failed: {report.report_data.download_error}
                </div>
              )}
            </div>
          )}
          
          <ReportDebugInfo report={report} />
        </div>
      </CardContent>
    </Card>
  );
};
