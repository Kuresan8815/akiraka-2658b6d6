import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isAfter, isBefore, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";
import { DateRangeFilter } from "@/components/history/DateRangeFilter";
import { ProductDetailsModal } from "@/components/history/ProductDetailsModal";
import { ScanHistoryList } from "@/components/history/ScanHistoryList";
import { ErrorState } from "@/components/history/ErrorState";
import { EmptyState } from "@/components/history/EmptyState";

export default function History() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data: scanHistory, isLoading, error, refetch } = useQuery({
    queryKey: ["scan_history"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("scan_history")
        .select("*, products(*)")
        .eq("user_id", user.id)
        .order("scanned_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredHistory = scanHistory?.filter((scan) => {
    if (!dateRange?.from && !dateRange?.to) return true;
    
    const scanDate = parseISO(scan.scanned_at);
    const isAfterStart = !dateRange.from || isAfter(scanDate, dateRange.from);
    const isBeforeEnd = !dateRange.to || isBefore(scanDate, dateRange.to);
    
    return isAfterStart && isBeforeEnd;
  });

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
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-4 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-eco-primary">Scan History</h2>
          <DateRangeFilter
            dateRange={dateRange}
            setDateRange={setDateRange}
            onClearFilters={clearFilters}
          />
        </div>

        {filteredHistory?.length === 0 ? (
          <EmptyState dateRange={dateRange} />
        ) : (
          <ScanHistoryList
            filteredHistory={filteredHistory}
            onSelectProduct={setSelectedProduct}
          />
        )}

        <ProductDetailsModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </div>
    </ScrollArea>
  );
}