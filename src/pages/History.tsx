import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { useNavigate } from "react-router-dom";
import { DateRangeFilter } from "@/components/history/DateRangeFilter";
import { ErrorState } from "@/components/history/ErrorState";
import { EmptyState } from "@/components/history/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { useScanHistory } from "@/hooks/useScanHistory";
import { Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Sample product data for when no scans exist
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

interface ScanItemProps {
  scan: any;
  isExpanded: boolean;
  onToggle: () => void;
}

const ScanItem = ({ scan, isExpanded, onToggle }: ScanItemProps) => {
  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader 
        className="cursor-pointer flex flex-row items-center justify-between"
        onClick={onToggle}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{scan.products?.name}</CardTitle>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Clock className="h-4 w-4 mr-1" />
            {format(new Date(scan.scanned_at), "PPp")}
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Certification Level:</span>
              <Badge variant="outline">{scan.products?.certification_level}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Origin:</span>
              <span className="text-sm">{scan.products?.origin}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Sustainability Score:</span>
              <span className="text-sm">{scan.products?.sustainability_score}/100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Carbon Footprint:</span>
              <span className="text-sm">{scan.products?.carbon_footprint} kg CO₂</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Water Usage:</span>
              <span className="text-sm">{scan.products?.water_usage} L</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default function History() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [expandedScans, setExpandedScans] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();

  const toggleScan = (scanId: string) => {
    setExpandedScans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scanId)) {
        newSet.delete(scanId);
      } else {
        newSet.add(scanId);
      }
      return newSet;
    });
  };

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
  } = useScanHistory(dateRange);

  const clearFilters = () => {
    setDateRange(undefined);
  };

  if (isAuthChecking || isLoading) {
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
    return <EmptyState dateRange={dateRange} />;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-eco-primary">Recent Scans</h2>
          <DateRangeFilter
            dateRange={dateRange}
            setDateRange={setDateRange}
            onClearFilters={clearFilters}
          />
        </div>

        <div className="space-y-4">
          {scanHistory.map((scan) => (
            <ScanItem
              key={scan.id}
              scan={scan}
              isExpanded={expandedScans.has(scan.id)}
              onToggle={() => toggleScan(scan.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}