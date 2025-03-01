
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GeneratedReport } from "@/types/reports";

interface ReportDebugInfoProps {
  report: GeneratedReport & { report_template: any };
}

export const ReportDebugInfo = ({ report }: ReportDebugInfoProps) => {
  const hasIssues = report.status === 'completed' && (!report.pdf_url || !report.page_count || report.page_count === 0);
  
  if (!hasIssues) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center mt-2 text-xs text-amber-600 cursor-help">
            <Info className="h-4 w-4 mr-1" />
            Potential issues detected
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-md">
          <div className="text-xs">
            <p className="font-bold">Debug Information:</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              {!report.pdf_url && <li>PDF URL is missing</li>}
              {!report.page_count && <li>Page count is missing</li>}
              {report.page_count === 0 && <li>Page count is zero (empty report)</li>}
              {report.report_data?.empty_metrics && <li>Report generated with empty metrics handling</li>}
              {report.pdf_url && <li>PDF URL: {report.pdf_url}</li>}
              <li>Report data keys: {Object.keys(report.report_data || {}).join(', ') || 'none'}</li>
              <li>Generated at: {report.generated_at}</li>
              <li>Status updates: {Array.isArray(report.report_data?.status_updates) ? report.report_data.status_updates.join(', ') : 'none'}</li>
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
