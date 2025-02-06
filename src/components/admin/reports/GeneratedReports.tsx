
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedReport } from "@/types/reports";
import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

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
        .select("*")
        .eq("business_id", businessId)
        .order("generated_at", { ascending: false });

      if (error) throw error;
      
      return (data as any[]).map(report => ({
        ...report,
        date_range: report.date_range ? {
          start: report.date_range.start,
          end: report.date_range.end
        } : null
      })) as GeneratedReport[];
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Report #{report.id.slice(0, 8)}</CardTitle>
                <CardDescription>
                  Generated on {format(new Date(report.generated_at), "PPP")}
                </CardDescription>
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
              <div className={`text-sm flex items-center gap-2 ${
                report.status === 'completed' ? 'text-green-600' :
                report.status === 'failed' ? 'text-red-600' :
                report.status === 'processing' ? 'text-blue-600' :
                'text-yellow-600'
              }`}>
                Status: {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                {report.status === 'processing' && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
