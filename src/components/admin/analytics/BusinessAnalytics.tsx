import { DateRange } from "react-day-picker";
import { ESGMetricsSection } from "./ESGMetricsSection";
import { SustainabilityImpactChart } from "./SustainabilityImpactChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface BusinessAnalyticsProps {
  dateRange: DateRange | undefined;
}

export const BusinessAnalytics = ({ dateRange }: BusinessAnalyticsProps) => {
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: currentBusiness, isLoading: businessLoading } = useQuery({
    queryKey: ["current-business", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const currentBusinessId = session?.user?.user_metadata?.current_business_id;
      
      if (!currentBusinessId) return null;

      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", currentBusinessId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  if (sessionLoading || businessLoading) {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[200px]" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentBusiness) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">No business selected. Please select a business to view analytics.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <ESGMetricsSection businessId={currentBusiness.id} />
      <SustainabilityImpactChart dateRange={dateRange} />
    </div>
  );
};