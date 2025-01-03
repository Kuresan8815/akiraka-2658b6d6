import { useState } from "react";
import { DateRange } from "react-day-picker";
import { DateRangeFilter } from "@/components/history/DateRangeFilter";
import { ErrorState } from "@/components/history/ErrorState";
import { ScanHistoryList } from "@/components/history/ScanHistoryList";
import { useToast } from "@/components/ui/use-toast";
import { useScanHistory } from "@/hooks/useScanHistory";

export default function History() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { toast } = useToast();

  const {
    scanHistory,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useScanHistory(dateRange);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Refreshed",
        description: "Your scan history has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh scan history",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setDateRange(undefined);
  };

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-eco-primary">Scan History</h2>
          <DateRangeFilter
            dateRange={dateRange}
            setDateRange={setDateRange}
            onClearFilters={clearFilters}
          />
        </div>

        <ScanHistoryList
          filteredHistory={scanHistory || []}
          onSelectProduct={() => {}}
          onRefresh={handleRefresh}
          isRefreshing={isRefetching}
        />
      </div>
    </div>
  );
}