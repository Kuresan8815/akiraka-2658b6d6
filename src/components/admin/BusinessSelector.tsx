import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Business } from "@/types/business";
import { useNavigate } from "react-router-dom";

export const BusinessSelector = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBusinesses();
    getCurrentBusiness();
  }, []);

  const fetchBusinesses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch business profiles for the current user
    const { data: businessProfiles, error } = await supabase
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
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching businesses:", error);
      toast({
        title: "Error",
        description: "Failed to load businesses",
        variant: "destructive",
      });
      return;
    }

    // Create a Map to store unique businesses
    const uniqueBusinesses = new Map<string, Business>();
    
    // Filter out null businesses and add to Map
    businessProfiles?.forEach(profile => {
      if (profile.businesses && !uniqueBusinesses.has(profile.businesses.id)) {
        uniqueBusinesses.set(profile.businesses.id, profile.businesses);
      }
    });

    // Convert Map values to array
    setBusinesses(Array.from(uniqueBusinesses.values()));
  };

  const getCurrentBusiness = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.current_business_id) {
      setSelectedBusiness(user.user_metadata.current_business_id);
    }
  };

  const handleBusinessChange = async (businessId: string) => {
    if (businessId === "new") {
      navigate("/onboarding");
      return;
    }

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

  return (
    <div className="space-y-4">
      <Select value={selectedBusiness} onValueChange={handleBusinessChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a business" />
        </SelectTrigger>
        <SelectContent>
          {businesses.map((business) => (
            <SelectItem key={business.id} value={business.id}>
              {business.name} ({business.business_type})
            </SelectItem>
          ))}
          <SelectItem value="new" className="text-eco-primary">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create New Business
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};