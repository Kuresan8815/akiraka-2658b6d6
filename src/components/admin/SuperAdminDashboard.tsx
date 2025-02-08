import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Region } from "@/types/admin";
import { Plus, Edit, Trash2 } from "lucide-react";

export const SuperAdminDashboard = () => {
  const [newRegionName, setNewRegionName] = useState("");
  const { toast } = useToast();

  const { data: regions, refetch: refetchRegions } = useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Region[];
    },
  });

  const createRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("regions")
        .insert({
          name: newRegionName,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Region created successfully",
      });
      setNewRegionName("");
      refetchRegions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Region Management</h1>
      
      <Card className="p-6">
        <form onSubmit={createRegion} className="space-y-4">
          <div>
            <label htmlFor="regionName" className="text-sm font-medium">
              Region Name
            </label>
            <Input
              id="regionName"
              value={newRegionName}
              onChange={(e) => setNewRegionName(e.target.value)}
              placeholder="Enter region name"
              required
            />
          </div>
          <Button type="submit">
            <Plus className="w-4 h-4 mr-2" />
            Create Region
          </Button>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {regions?.map((region) => (
          <Card key={region.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{region.name}</h3>
                <p className="text-sm text-gray-500">
                  Created: {new Date(region.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};