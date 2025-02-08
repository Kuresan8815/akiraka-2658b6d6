
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Business } from "@/types/business";

export const useBusinessSelection = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBusinesses();
    getCurrentBusiness();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setBusinesses([]);
        return;
      }

      const { data: businessProfiles, error: profileError } = await supabase
        .from("business_profiles")
        .select(`
          business_id,
          role,
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
        .eq("businesses.is_active", true);

      if (profileError) {
        console.error("Error fetching business profiles:", profileError);
        throw profileError;
      }

      const validBusinesses = businessProfiles
        ?.filter(profile => profile.businesses)
        .map(profile => ({
          ...profile.businesses,
          role: profile.role
        }));

      setBusinesses(validBusinesses || []);
    } catch (error) {
      console.error("Error in fetchBusinesses:", error);
      toast({
        title: "Error",
        description: "Failed to load businesses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentBusiness = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.current_business_id) {
        // Verify the user still has access to this business
        const { data: profile } = await supabase
          .from("business_profiles")
          .select("business_id")
          .eq("user_id", user.id)
          .eq("business_id", user.user_metadata.current_business_id)
          .maybeSingle();

        if (profile) {
          setSelectedBusiness(user.user_metadata.current_business_id);
        }
      }
    } catch (error) {
      console.error("Error getting current business:", error);
    }
  };

  const handleBusinessChange = async (businessId: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { current_business_id: businessId }
      });

      if (error) throw error;

      setSelectedBusiness(businessId);
      toast({
        title: "Success",
        description: "Business switched successfully",
      });

      // Refresh the page to ensure all data is updated for the new business
      window.location.reload();
    } catch (error) {
      console.error("Error in handleBusinessChange:", error);
      toast({
        title: "Error",
        description: "Failed to switch business. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    businesses,
    selectedBusiness,
    handleBusinessChange,
    isLoading,
    refetchBusinesses: fetchBusinesses,
  };
};
