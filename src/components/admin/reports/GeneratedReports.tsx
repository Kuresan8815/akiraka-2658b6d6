
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedReport } from "@/types/reports";
import { Download, FileText, Loader2, BarChart3, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface GeneratedReportsProps {
  businessId?: string;
}

export const GeneratedReports = ({ businessId }: GeneratedReportsProps) => {
  const { data: reports, isLoading } = useQuery({
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
      
      return (data as any[]).map(report => ({
        ...report,
        date_range: report.date_range ? {
          start: report.date_range.start,
          end: report.date_range.end
        } : null
      })) as (GeneratedReport & { report_template: any })[];
    },
  });

  if (isLoading) {
    return <div>Loading reports...</div>;
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
        <Card key={report.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  Report #{report.id.slice(0, 8)}
                  <Badge variant={
                    report.status === 'completed' ? 'success' :
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
              {report.pdf_url && report.status === 'completed' && (
                <Button variant="outline" size="sm" asChild>
                  <a href={report.pdf_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                    {report.file_size && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({Math.round(report.file_size / 1024)}KB)
                      </span>
                    )}
                  </a>
                </Button>
              )}
              {report.status === 'processing' && (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
