
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

export const GeneratedReports = ({ businessId }: { businessId?: string }) => {
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "failed">("all");
  const queryClient = useQueryClient();

  // Fetch reports
  const {
    data: reports,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["generated-reports", businessId],
    queryFn: async () => {
      if (!businessId) {
        return [];
      }

      const { data, error } = await supabase
        .from("generated_reports")
        .select("*, report_template(*)")
        .eq("business_id", businessId)
        .order("generated_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
  });

  // Download report mutation
  const downloadMutation = useMutation({
    mutationFn: async (report: GeneratedReport) => {
      try {
        // Create a link and click it to download the PDF
        const link = document.createElement("a");
        link.href = report.pdf_url || "";
        link.target = "_blank";
        link.download = `Report_${report.id.slice(0, 8)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return { success: true };
      } catch (error) {
        throw error;
      }
    },
    onError: (error) => {
      toast({
        title: "Download Failed",
        description: `Failed to download report: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Retry report mutation
  const retryMutation = useMutation({
    mutationFn: async (report: GeneratedReport) => {
      try {
        // Log the retry attempt in the report
        const retryCount = (report.report_data?.retry_count || 0) + 1;
        const { error: updateError } = await supabase
          .from("generated_reports")
          .update({
            status: "pending",
            report_data: {
              ...report.report_data,
              retry_count: retryCount,
              retry_at: new Date().toISOString(),
            },
          })
          .eq("id", report.id);

        if (updateError) throw updateError;
        
        // Call the generate-test-pdf edge function to create a test PDF
        const { data, error } = await supabase.functions.invoke("generate-test-pdf", {
          body: { reportId: report.id }
        });
        
        if (error) throw error;
        if (data.error) throw new Error(data.error);
        
        // No need to update the report status here as the edge function will do it
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Report Retry Initiated",
        description: "The report is being regenerated with test data. It will be available shortly.",
      });
      // Refetch reports after a short delay to allow the edge function to complete
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["generated-reports", businessId] });
      }, 2000);
    },
    onError: (error) => {
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
          Error loading reports. Please try again.
        </p>
        <Button onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (!reports?.length) {
    return <EmptyReportsState businessId={businessId} />;
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
