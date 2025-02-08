import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CreateBusinessForm } from "./CreateBusinessForm";
import { BusinessList } from "./BusinessList";

export const BusinessProfileManager = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: businessProfiles, refetch: refetchProfiles } = useQuery({
    queryKey: ["business_profiles", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_profiles")
        .select(`
          *,
          businesses:business_id (*)
        `)
        .eq("user_id", session?.user?.id);

      if (error) throw error;
      return data;
    },
  });

  const handleProfileSwitch = async (businessId: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { current_business_id: businessId }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business profile switched successfully",
      });

      refetchProfiles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Business Profiles</h2>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "Cancel" : "Add Business Profile"}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="p-6">
          <CreateBusinessForm
            selectedIndustry=""
            onSuccess={() => {
              setShowCreateForm(false);
              refetchProfiles();
            }}
          />
        </Card>
      )}

      <BusinessList
        profiles={businessProfiles || []}
        onProfileSwitch={handleProfileSwitch}
        currentBusinessId={session?.user?.user_metadata?.current_business_id}
      />
    </div>
  );
};