import { useQuery } from "@tanstack/react-query";
import { CarbonEmissionsForm } from "@/components/admin/carbon/CarbonEmissionsForm";
import { EmissionsSummaryChart } from "@/components/admin/carbon/EmissionsSummaryChart";
import { EmissionsTrendChart } from "@/components/admin/carbon/EmissionsTrendChart";
import { BusinessSelector } from "@/components/admin/BusinessSelector";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const CarbonFootprint = () => {
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  const { data: userRole } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("admin_users")
        .select("account_level")
        .eq("id", user.id)
        .single();

      return data?.account_level;
    },
  });

  if (!selectedBusinessId) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Carbon Footprint Tracking</h1>
        <BusinessSelector onSelect={setSelectedBusinessId} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Carbon Footprint Tracking</h1>
        <BusinessSelector onSelect={setSelectedBusinessId} value={selectedBusinessId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CarbonEmissionsForm businessId={selectedBusinessId} />
        <EmissionsSummaryChart businessId={selectedBusinessId} />
      </div>

      <div className="mt-6">
        <EmissionsTrendChart businessId={selectedBusinessId} />
      </div>
    </div>
  );
};