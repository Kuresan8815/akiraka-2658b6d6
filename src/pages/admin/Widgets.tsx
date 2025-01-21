import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { WidgetSelector } from "@/components/admin/widgets/WidgetSelector";
import { TemplateSelector } from "@/components/admin/widgets/TemplateSelector";
import { WidgetMetrics } from "@/components/admin/widgets/WidgetMetrics";
import { useToast } from "@/hooks/use-toast";

export const AdminWidgets = () => {
  const { toast } = useToast();
  
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: businessProfile } = useQuery({
    queryKey: ["business-profile", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_profiles")
        .select("business_id")
        .eq("user_id", session?.user?.id);

      if (error) {
        console.error("Error fetching business profiles:", error);
        toast({
          title: "Error",
          description: "Failed to load business profile",
          variant: "destructive",
        });
        throw error;
      }

      if (!data || data.length === 0) {
        return null;
      }

      return data[0];
    },
  });

  if (!businessProfile?.business_id) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <p className="text-center text-gray-500">
            Please select or create a business profile first.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Metrics Dashboard</h1>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="metrics">Active Metrics</TabsTrigger>
          <TabsTrigger value="add">Add Metrics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <Card className="p-6">
            <WidgetMetrics businessId={businessProfile.business_id} />
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card className="p-6">
            <WidgetSelector businessId={businessProfile.business_id} />
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="p-6">
            <TemplateSelector businessId={businessProfile.business_id} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};