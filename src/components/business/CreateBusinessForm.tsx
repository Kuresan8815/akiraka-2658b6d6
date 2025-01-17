import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface CreateBusinessFormProps {
  onSuccess: () => void;
}

type BusinessType = 'manufacturer' | 'retailer' | 'distributor' | 'supplier';

export const CreateBusinessForm = ({ onSuccess }: CreateBusinessFormProps) => {
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType | "">("");
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
    if (!businessType) {
      toast({
        title: "Error",
        description: "Please select a business type",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    try {
      // First create the business
      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .insert({
          name,
          business_type: businessType,
          created_by: session?.user?.id,
          industry_type: "Other", // Default value to satisfy the NOT NULL constraint
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // Then create the business profile
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

      onSuccess();
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
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium">
          Business Type
        </label>
        <Select value={businessType} onValueChange={(value) => setBusinessType(value as BusinessType)} required>
          <SelectTrigger>
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manufacturer">Manufacturer</SelectItem>
            <SelectItem value="retailer">Retailer</SelectItem>
            <SelectItem value="distributor">Distributor</SelectItem>
            <SelectItem value="supplier">Supplier</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Business Profile"}
      </Button>
    </form>
  );
};