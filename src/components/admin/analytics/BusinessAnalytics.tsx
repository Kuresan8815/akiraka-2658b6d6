import { DateRange } from "react-day-picker";
import { ESGMetricsSection } from "./ESGMetricsSection";
import { SustainabilityImpactChart } from "./SustainabilityImpactChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BusinessAnalyticsProps {
  dateRange: DateRange | undefined;
}

export const BusinessAnalytics = ({ dateRange }: BusinessAnalyticsProps) => {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: currentBusiness } = useQuery({
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

  if (!currentBusiness) return null;

  return (
    <div className="space-y-8">
      <ESGMetricsSection businessId={currentBusiness.id} />
      <SustainabilityImpactChart dateRange={dateRange} />
    </div>
  );
};