
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedReport } from "@/types/reports";
import { Download, FileText, Loader2, BarChart3, PieChart, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GeneratedReportsProps {
  businessId?: string;
}

export const GeneratedReports = ({ businessId }: GeneratedReportsProps) => {
  const { data: reports, isLoading, error } = useQuery({
    queryKey: ["generated-reports", businessId],
    enabled: !!businessId,
    refetchInterval: 5000, // Poll every 5 seconds for updates
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
      
      console.log("Reports fetched:", data); // Debug fetched reports
      
      return (data as any[]).map(report => ({
        ...report,
        date_range: report.date_range ? {
          start: report.date_range.start,
          end: report.date_range.end
        } : null
      })) as (GeneratedReport & { report_template: any })[];
    },
  });

  const handleDownload = async (report: GeneratedReport & { report_template: any }) => {
    if (!report.pdf_url) {
      toast({
        title: "Error",
        description: "PDF URL is missing. Please regenerate the report.",
        variant: "destructive",
      });
      return;
    }

    console.log("Attempting to download PDF from:", report.pdf_url);
    
    try {
      // Try to fetch the file to check if it exists
      const response = await fetch(report.pdf_url, { method: 'HEAD' });
      
      if (!response.ok) {
        console.error(`PDF file not found: ${report.pdf_url}`, response.status, response.statusText);
        
        toast({
          title: "File Not Found",
          description: `The PDF file could not be found (${response.status}: ${response.statusText}). Please regenerate the report.`,
          variant: "destructive",
        });
        
        // Update the report status to reflect the issue
        await supabase
          .from("generated_reports")
          .update({ 
            status: "failed", 
            report_data: { 
              ...report.report_data,
              error: `PDF file not found: ${response.status} ${response.statusText}`,
              timestamp: new Date().toISOString()
            } 
          })
          .eq("id", report.id);
        
        return;
      }
      
      // File exists, proceed with download
      window.open(report.pdf_url, '_blank');
    } catch (error) {
      console.error("Error checking/downloading PDF:", error);
      toast({
        title: "Download Error",
        description: "There was an error downloading the file. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleRetry = async (report: GeneratedReport & { report_template: any }) => {
    try {
      // Reset the report status to pending for reprocessing
      const { error } = await supabase
        .from("generated_reports")
        .update({ 
          status: "pending", 
          report_data: {
            ...report.report_data,
            retry_timestamp: new Date().toISOString(),
            retry_count: (report.report_data.retry_count || 0) + 1
          }
        })
        .eq("id", report.id);
      
      if (error) throw error;
      
      // Call the edge function to regenerate the report
      const { data: fnResponse, error: fnError } = await supabase.functions.invoke('generate-esg-report', {
        body: { 
          report_id: report.id,
          business_id: businessId,
          retry: true
        }
      });
      
      if (fnError) throw fnError;
      
      toast({
        title: "Report Regeneration Started",
        description: "Your report is being regenerated. This may take a few moments.",
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
    return (
      <Card className="bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <CardTitle>Error Loading Reports</CardTitle>
            <CardDescription className="text-red-600">
              {error instanceof Error ? error.message : "Failed to load reports"}
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Loader2 className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
            <CardTitle>Loading reports...</CardTitle>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reports?.length) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <CardTitle>No generated reports</CardTitle>
            <CardDescription>
              Generate a report from one of your templates to see it here
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id} className={report.status === 'failed' ? 'border-red-300 bg-red-50' : ''}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  Report #{report.id.slice(0, 8)}
                  <Badge variant={
                    report.status === 'completed' ? 'default' :
                    report.status === 'failed' ? 'destructive' :
                    'secondary'
                  }>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </Badge>
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
              
              {report.status === 'completed' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDownload(report)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                  {report.file_size && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({Math.round(report.file_size / 1024)}KB)
                    </span>
                  )}
                </Button>
              )}
              
              {report.status === 'processing' && (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
              
              {report.status === 'failed' && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleRetry(report)}
                  >
                    <Loader2 className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
              )}
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
              {report.page_count && (
                <div className="text-gray-500">
                  Pages: {report.page_count}
                </div>
              )}
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
              
              {/* Debug info for developers */}
              {(report.status === 'completed' && (!report.pdf_url || !report.page_count)) && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center mt-2 text-xs text-amber-600">
                        <Info className="h-4 w-4 mr-1" />
                        Potential issues detected
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <div className="text-xs">
                        <p className="font-bold">Debug Information:</p>
                        <ul className="list-disc pl-4 mt-1 space-y-1">
                          {!report.pdf_url && <li>PDF URL is missing</li>}
                          {!report.page_count && <li>Page count is missing (possibly empty report)</li>}
                          {report.pdf_url && <li>PDF URL: {report.pdf_url}</li>}
                          <li>Report data keys: {Object.keys(report.report_data).join(', ') || 'none'}</li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
