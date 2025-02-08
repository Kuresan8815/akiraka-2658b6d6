import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const RegionalAdminDashboard = () => {
  const navigate = useNavigate();

  const { data: businesses } = useQuery({
    queryKey: ["regional-businesses"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: adminData } = await supabase
        .from("regional_admins")
        .select("region_id")
        .eq("user_id", user.id)
        .single();

      if (!adminData) throw new Error("No region assigned");

      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("region_id", adminData.region_id);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Business Management</h1>
        <Button onClick={() => navigate("/admin/businesses/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Add Business
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {businesses?.map((business) => (
          <Card key={business.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-100 rounded-full">
                <Building2 className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold">{business.name}</h3>
                <p className="text-sm text-gray-500">{business.business_type}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};