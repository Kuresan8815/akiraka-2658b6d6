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

    // Query only businesses created by the current user
    const { data, error } = await supabase
      .from("businesses")
      .select(`
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
      `)
      .eq('created_by', user.id)
      .eq('is_active', true);

    if (error) {
      console.error("Error fetching businesses:", error);
      toast({
        title: "Error",
        description: "Failed to load businesses",
        variant: "destructive",
      });
      return;
    }

    // Set the businesses directly since we're already filtering by created_by
    setBusinesses(data || []);
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