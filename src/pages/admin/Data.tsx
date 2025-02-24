
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

  // Get the current business ID
  const { data: businessProfile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return null;

      // Get the first active business profile for this user
      const { data, error } = await supabase
        .from("business_profiles")
        .select(`
          id,
          business_id,
          user_id,
          role,
          created_at,
          updated_at
        `)
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching business profile:", error);
        throw error;
      }

      console.log("Business profile:", data);
      return data;
    },
  });

  // Fetch active metrics for the current business
  const { data: activeMetrics } = useQuery({
    queryKey: ["active-metrics", businessProfile?.business_id, activeTab],
    queryFn: async () => {
      if (!businessProfile?.business_id) {
        console.log("No business ID available");
        return null;
      }

      console.log("Fetching metrics for business:", businessProfile.business_id, "category:", activeTab);
      
      const query = supabase
        .from("business_widgets")
        .select(`
          id,
          widget_id,
          position,
          is_active,
          widget:widgets(*)
        `)
        .eq("business_id", businessProfile.business_id)
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
        .filter(item => item.widget !== null) // Filter out any null widgets
        .map(item => ({
          id: item.id,
          widget_id: item.widget_id,
          position: item.position,
          widget: item.widget
        })) as BusinessWidget[];

      console.log("Transformed business widgets:", transformedData);
      return transformedData;
    },
    enabled: !!businessProfile?.business_id,
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
              businessId={businessProfile?.business_id}
            />
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card className="p-6">
            <DataEntryTable 
              category="social" 
              activeMetrics={activeMetrics}
              businessId={businessProfile?.business_id}
            />
          </Card>
        </TabsContent>

        <TabsContent value="governance">
          <Card className="p-6">
            <DataEntryTable 
              category="governance" 
              activeMetrics={activeMetrics}
              businessId={businessProfile?.business_id}
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
