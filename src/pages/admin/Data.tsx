
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataEntryTable } from "@/components/admin/data/DataEntryTable";
import { BulkDataUpload } from "@/components/admin/data/BulkDataUpload";
import { APIIntegration } from "@/components/admin/data/APIIntegration";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { BusinessWidget } from "@/types/widgets";

export const AdminData = () => {
  const [activeTab, setActiveTab] = useState<'environmental' | 'social' | 'governance'>('environmental');

  // Get the current user's session
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // Get the current business ID from user metadata
  const { data: currentBusiness } = useQuery({
    queryKey: ["current-business", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const currentBusinessId = session?.user?.user_metadata?.current_business_id;
      
      if (!currentBusinessId) return null;

      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", currentBusinessId)
        .single();

      return data;
    },
  });

  // Fetch active metrics for the current business
  const { data: activeMetrics } = useQuery({
    queryKey: ["active-metrics", currentBusiness?.id, activeTab],
    enabled: !!currentBusiness?.id,
    queryFn: async () => {
      if (!currentBusiness?.id) {
        console.log("No business ID available");
        return null;
      }

      console.log("Fetching metrics for business:", currentBusiness.id, "category:", activeTab);
      
      const query = supabase
        .from("business_widgets")
        .select(`
          id,
          widget_id,
          position,
          is_active,
          widget:widgets(*)
        `)
        .eq("business_id", currentBusiness.id)
        .eq("is_active", true);

      if (activeTab) {
        query.eq("widgets.category", activeTab);
      }

      const { data, error } = await query.order("position");
      
      if (error) {
        console.error("Error fetching business widgets:", error);
        throw error;
      }

      console.log("Fetched business widgets:", data);

      // Transform the data to match BusinessWidget type
      const transformedData = (data || [])
        .filter(item => item.widget !== null)
        .map(item => ({
          id: item.id,
          widget_id: item.widget_id,
          position: item.position,
          widget: item.widget
        })) as BusinessWidget[];

      console.log("Transformed business widgets:", transformedData);
      return transformedData;
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Data Management</h1>
          <p className="text-gray-500 mt-2">
            Enter and manage ESG metrics with blockchain verification
          </p>
        </div>
      </div>

      <Tabs defaultValue="environmental" className="w-full" onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="mb-4">
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>

        <TabsContent value="environmental">
          <Card className="p-6">
            <DataEntryTable 
              category="environmental" 
              activeMetrics={activeMetrics}
              businessId={currentBusiness?.id}
            />
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card className="p-6">
            <DataEntryTable 
              category="social" 
              activeMetrics={activeMetrics}
              businessId={currentBusiness?.id}
            />
          </Card>
        </TabsContent>

        <TabsContent value="governance">
          <Card className="p-6">
            <DataEntryTable 
              category="governance" 
              activeMetrics={activeMetrics}
              businessId={currentBusiness?.id}
            />
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Bulk Upload</h2>
          <BulkDataUpload />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">API Integration</h2>
          <APIIntegration />
        </Card>
      </div>
    </div>
  );
};
