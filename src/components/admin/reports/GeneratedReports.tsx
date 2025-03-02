
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmptyReportsState } from "./components/EmptyReportsState";
import { ReportsLoading } from "./components/ReportsLoading";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { ReportCard } from "./components/ReportCard";
import { GeneratedReport } from "@/types/reports";
import { toast } from "@/hooks/use-toast";
import { parseReportData, getStatusUpdates, addStatusUpdate, isPdfUrlValid } from "./utils/reportDataUtils";
import { Json } from "@/integrations/supabase/types";

export const GeneratedReports = ({ businessId }: { businessId?: string }) => {
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "failed">("all");
  const queryClient = useQueryClient();

  // Fetch reports
  const {
    data: reports,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["generated-reports", businessId],
    queryFn: async () => {
      if (!businessId) {
        console.log("No business ID provided");
        return [];
      }

      console.log("Fetching reports for business:", businessId);
      try {
        const { data, error } = await supabase
          .from("generated_reports")
          .select("*, report_template(*)")
          .eq("business_id", businessId)
          .order("generated_at", { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Reports fetched:", data?.length || 0);
        
        return (data || []).map(report => ({
          id: report.id,
          template_id: report.template_id,
          business_id: report.business_id,
          generated_at: report.generated_at,
          report_data: parseReportData(report.report_data),
          pdf_url: report.pdf_url,
          status: report.status,
          generated_by: report.generated_by,
          date_range: report.date_range as any,
          metadata: report.metadata as Record<string, any> | null,
          file_size: report.file_size,
          page_count: report.page_count,
          report_template: report.report_template
        })) as Array<GeneratedReport & { report_template: any }>;
      } catch (err) {
        console.error("Error fetching reports:", err);
        throw err;
      }
    },
    enabled: !!businessId,
  });

  // Download report mutation
  const downloadMutation = useMutation({
    mutationFn: async (report: GeneratedReport & { report_template: any }) => {
      try {
        console.log("Attempting to download report:", report.id);
        
        if (!report.pdf_url) {
          console.warn("No PDF URL available for report:", report.id);
          throw new Error("No PDF URL available");
        }
        
        // First try to verify the PDF exists by calling the edge function
        console.log("Verifying PDF existence via edge function");
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke("download-report", {
          body: { reportId: report.id, verify: true }
        });
        
        if (verifyError) {
          console.error("Edge function verification error:", verifyError);
          throw new Error(verifyError.message || "Failed to verify PDF");
        }
        
        if (verifyData && verifyData.error) {
          console.error("Verification returned error:", verifyData.error);
          throw new Error(verifyData.error || "Failed to verify PDF");
        }
        
        console.log("PDF verification succeeded, attempting direct download");
        // If verification is successful, use direct download
        const link = document.createElement("a");
        link.href = report.pdf_url;
        link.target = "_blank";
        link.download = `Report_${report.id.slice(0, 8)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return { success: true };
      } catch (error: any) {
        console.error("Download error:", error);
        
        // If direct download fails, try through edge function
        try {
          console.log("Attempting download through edge function");
          const { data: downloadData, error: downloadError } = await supabase.functions.invoke("download-report", {
            body: { reportId: report.id }
          });
          
          if (downloadError) {
            console.error("Edge function download error:", downloadError);
            throw downloadError;
          }
          
          if (downloadData.error) {
            console.error("Download response error:", downloadData.error);
            throw new Error(downloadData.error);
          }
          
          if (downloadData.url) {
            console.log("Got download URL from edge function:", downloadData.url);
            const link = document.createElement("a");
            link.href = downloadData.url;
            link.target = "_blank";
            link.download = `Report_${report.id.slice(0, 8)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return { success: true };
          }
          
          throw new Error("No download URL returned");
        } catch (secondError: any) {
          // If both methods fail, update the report record with the error
          console.error("Both download methods failed:", secondError);
          const reportData = report.report_data || {};
          const updatedReportData = {
            ...reportData,
            download_error: `${error.message}. Proxy download: ${secondError.message}`,
            download_attempt: new Date().toISOString()
          };
          
          await supabase
            .from("generated_reports")
            .update({
              report_data: updatedReportData
            })
            .eq("id", report.id);
            
          throw new Error(`Failed to download: ${secondError.message}`);
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: `Failed to download report: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Retry report mutation
  const retryMutation = useMutation({
    mutationFn: async (report: GeneratedReport & { report_template: any }) => {
      try {
        console.log("Retrying report generation:", report.id);
        const retryCount = (report.report_data?.retry_count || 0) + 1;
        const reportData = addStatusUpdate(
          report.report_data || {}, 
          `Retry attempt #${retryCount} initiated`
        );
        
        const { error: updateError } = await supabase
          .from("generated_reports")
          .update({
            status: "pending",
            report_data: {
              ...reportData,
              retry_count: retryCount,
              retry_at: new Date().toISOString(),
            },
          })
          .eq("id", report.id);

        if (updateError) {
          console.error("Error updating report status:", updateError);
          throw updateError;
        }
        
        console.log("Calling generate-test-pdf function");
        const { data, error } = await supabase.functions.invoke("generate-test-pdf", {
          body: { reportId: report.id }
        });
        
        if (error) {
          console.error("Edge function error:", error);
          throw error;
        }
        
        if (data && data.error) {
          console.error("Function returned error:", data.error);
          throw new Error(data.error);
        }
        
        console.log("Function response:", data);
        return data;
      } catch (error: any) {
        console.error("Retry error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Report Retry Initiated",
        description: "The report is being regenerated with test data. It will be available shortly.",
      });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["generated-reports", businessId] });
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Retry Failed",
        description: `Failed to retry report: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter reports based on active tab
  const filteredReports = reports
    ? reports.filter((report) => {
        if (activeTab === "all") return true;
        if (activeTab === "completed")
          return report.status === "completed";
        if (activeTab === "failed") return report.status === "failed";
        return true;
      })
    : [];

  if (isLoading) {
    return <ReportsLoading />;
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">
          Error loading reports: {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <Button onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (!reports?.length) {
    return <EmptyReportsState business_id={businessId} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("all")}
          >
            All Reports
          </Button>
          <Button
            variant={activeTab === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </Button>
          <Button
            variant={activeTab === "failed" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("failed")}
          >
            Failed
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["generated-reports", businessId] })}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh List
        </Button>
      </div>

      {filteredReports.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">No {activeTab} reports found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onDownload={() => downloadMutation.mutate(report)}
              onRetry={() => retryMutation.mutate(report)}
              isDownloading={downloadMutation.isPending}
            />
          ))}
        </div>
      )}
      
      {downloadMutation.isPending && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg p-4 rounded-lg flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Downloading report...</span>
        </div>
      )}
      
      {retryMutation.isPending && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg p-4 rounded-lg flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Retrying report generation...</span>
        </div>
      )}
    </div>
  );
};
