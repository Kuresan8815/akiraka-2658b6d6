
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportTemplates } from "./ReportTemplates";
import { GeneratedReports } from "./GeneratedReports";
import { CreateReportDialog } from "./CreateReportDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const ReportsDashboard = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: currentBusiness } = useQuery({
    queryKey: ["current-business"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.current_business_id) return null;

      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", user.user_metadata.current_business_id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-eco-primary">Reports</h1>
          <p className="text-gray-500">Create and manage your business reports</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Report
        </Button>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="generated">Generated Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="templates">
          <ReportTemplates businessId={currentBusiness?.id} />
        </TabsContent>
        <TabsContent value="generated">
          <GeneratedReports businessId={currentBusiness?.id} />
        </TabsContent>
      </Tabs>

      <CreateReportDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        businessId={currentBusiness?.id}
      />
    </div>
  );
};
