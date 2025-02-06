
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Business } from "@/types/business";

export const useBusinessSelection = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchBusinesses();
    getCurrentBusiness();
  }, []);

  const fetchBusinesses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // First get the most recently created business profile for this user
    const { data: businessProfile, error: profileError } = await supabase
      .from("business_profiles")
      .select(`
        business_id,
        businesses (
          id,
          name,
          business_type,
          created_at,
          updated_at,
          created_by,
          is_active,
          industry_type,
          logo_url,
          website,
          description,
          activities,
          sustainability_goals
        )
      `)
      .eq("user_id", user.id)
      .eq("businesses.name", "Beppu City")
      .eq("businesses.is_active", true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching business profiles:", profileError);
      toast({
        title: "Error",
        description: "Failed to load businesses",
        variant: "destructive",
      });
      return;
    }

    // Set the business if it exists
    if (businessProfile?.businesses) {
      setBusinesses([businessProfile.businesses]);
    } else {
      setBusinesses([]);
    }
  };

  const getCurrentBusiness = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.current_business_id) {
      setSelectedBusiness(user.user_metadata.current_business_id);
    }
  };

  const handleBusinessChange = async (businessId: string) => {
    const { error } = await supabase.auth.updateUser({
      data: { current_business_id: businessId }
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to switch business",
        variant: "destructive",
      });
      return;
    }

    setSelectedBusiness(businessId);
    toast({
      title: "Success",
      description: "Business switched successfully",
    });
  };

  return {
    businesses,
    selectedBusiness,
    handleBusinessChange,
  };
};
