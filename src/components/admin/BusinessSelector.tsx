import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Business } from "@/types/business";

export const BusinessSelector = () => {
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

    const { data, error } = await supabase
      .from("business_profiles")
      .select(`
        businesses (
          id,
          name,
          business_type
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load businesses",
        variant: "destructive",
      });
      return;
    }

    const businessList = data?.map(item => item.businesses) || [];
    setBusinesses(businessList);
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

  return (
    <div className="w-full max-w-xs">
      <Select value={selectedBusiness} onValueChange={handleBusinessChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a business" />
        </SelectTrigger>
        <SelectContent>
          {businesses.map((business) => (
            <SelectItem key={business.id} value={business.id}>
              {business.name} ({business.business_type})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};