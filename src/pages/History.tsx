import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { useNavigate } from "react-router-dom";
import { DateRangeFilter } from "@/components/history/DateRangeFilter";
import { ErrorState } from "@/components/history/ErrorState";
import { EmptyState } from "@/components/history/EmptyState";
import { LatestScan } from "@/components/history/LatestScan";
import { PreviousScans } from "@/components/history/PreviousScans";
import { useToast } from "@/hooks/use-toast";
import { useScanHistory } from "@/hooks/useScanHistory";
import { Product } from "@/types/product";
import { ScanHistoryItem } from "@/types/scan";
import { supabase } from "@/integrations/supabase/client";

// Type guard to validate certification level
const isValidCertificationLevel = (level: string): level is Product["certification_level"] => {
  return ["Bronze", "Silver", "Gold"].includes(level);
};

// Function to validate and transform scan data
const validateScanData = (scan: any): ScanHistoryItem => {
  const certLevel = scan.products.certification_level;
  if (!isValidCertificationLevel(certLevel)) {
    console.warn(`Invalid certification level: ${certLevel}, defaulting to Bronze`);
  }

  return {
    ...scan,
    products: {
      ...scan.products,
      certification_level: isValidCertificationLevel(certLevel) ? certLevel : "Bronze"
    }
  };
};

export default function History() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const {
    scanHistory,
    isLoading,
    error,
    refetch,
    isRefetching,
    lastScan,
    previousScans
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

  if (!scanHistory?.length) {
    return <EmptyState dateRange={dateRange} />;
  }

  // Validate scan data before passing to components
  const validatedLastScan = lastScan ? validateScanData(lastScan) : undefined;
  const validatedPreviousScans = previousScans?.map(validateScanData) || [];

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

        {validatedLastScan && <LatestScan scan={validatedLastScan} />}

        <PreviousScans
          scans={validatedPreviousScans}
          onSelectProduct={() => {}}
          onRefresh={handleRefresh}
          isRefreshing={isRefetching}
        />
      </div>
    </div>
  );
}