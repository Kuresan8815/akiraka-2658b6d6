import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isAfter, isBefore, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";

export const useScanHistory = (dateRange: DateRange | undefined) => {
  const { 
    data: scanHistory, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuery({
    queryKey: ["scan_history"],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
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

  return {
    scanHistory: filteredHistory,
    isLoading,
    error,
    refetch,
    isRefetching,
    lastScan: filteredHistory?.[0],
    previousScans: filteredHistory?.slice(1) || []
  };
};