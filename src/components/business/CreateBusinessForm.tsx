
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface CreateBusinessFormProps {
  onSuccess: (businessId: string) => void;
  selectedIndustry: string;
}

const getBusinessTypeFromIndustry = (industry: string): 'manufacturer' | 'retailer' | 'distributor' | 'supplier' | 'public_institution' => {
  switch (industry) {
    case "Manufacturing":
      return "manufacturer";
    case "Retail":
      return "retailer";
    case "Transportation":
    case "Energy":
      return "distributor";
    case "Agriculture":
      return "supplier";
    case "Public Institutions/Organizations":
    case "Government":
      return "public_institution";
    default:
      return "manufacturer"; // Default fallback
  }
};

export const CreateBusinessForm = ({ onSuccess, selectedIndustry }: CreateBusinessFormProps) => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const businessType = getBusinessTypeFromIndustry(selectedIndustry);

      // Create the business with the determined business type
      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .insert({
          name,
          business_type: businessType,
          created_by: session?.user?.id,
          industry_type: selectedIndustry,
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // Create the business profile
      const { error: profileError } = await supabase
        .from("business_profiles")
        .insert({
          business_id: business.id,
          user_id: session?.user?.id,
          role: "owner",
        });

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "Business profile created successfully",
      });

      onSuccess(business.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Business Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter your business name"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Business Profile"}
      </Button>
    </form>
  );
};
