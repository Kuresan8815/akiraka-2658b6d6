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
import { supabase } from "@/integrations/supabase/client";
import { ProductDetails } from "@/components/ProductDetails";

// Sample product data
const SAMPLE_PRODUCT: Product = {
  id: "sample",
  name: "Eco-Friendly Water Bottle",
  certification_level: "Gold",
  carbon_footprint: 0.5,
  water_usage: 2,
  origin: "Sustainable Factory, Sweden",
  qr_code_id: "demo",
  sustainability_score: 85,
};

// Type guard to validate certification level
const isValidCertificationLevel = (level: string): level is Product["certification_level"] => {
  return ["Bronze", "Silver", "Gold"].includes(level);
};

// Function to validate and transform scan data
const validateScanData = (scan: any) => {
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
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!session) {
          navigate('/login');
          return;
        }
        setIsAuthChecking(false);
      } catch (error: any) {
        console.error('Auth error:', error);
        toast({
          title: "Authentication Error",
          description: "Please sign in to view your scan history",
          variant: "destructive",
        });
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
  }, [navigate, toast]);

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

  // Don't render anything while checking auth
  if (isAuthChecking) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  // Only show loading state after auth is confirmed
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  if (!scanHistory?.length) {
    return (
      <div className="p-4 max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-eco-primary">Sample Scan</h2>
        </div>
        <ProductDetails product={SAMPLE_PRODUCT} />
        <EmptyState dateRange={dateRange} />
      </div>
    );
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