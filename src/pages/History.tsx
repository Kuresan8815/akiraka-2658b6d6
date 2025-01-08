import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { useNavigate } from "react-router-dom";
import { DateRangeFilter } from "@/components/history/DateRangeFilter";
import { ScanHistoryList } from "@/components/history/ScanHistoryList";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  if (isAuthChecking) {
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
          <h2 className="text-2xl font-bold text-eco-primary">Recent Scans</h2>
          <DateRangeFilter
            dateRange={dateRange}
            setDateRange={setDateRange}
            onClearFilters={() => setDateRange(undefined)}
          />
        </div>
        <ScanHistoryList 
          filteredHistory={[]} 
          onSelectProduct={() => {}}
          onRefresh={() => {}}
        />
      </div>
    </div>
  );
}