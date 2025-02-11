
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportTemplates } from "./ReportTemplates";
import { GeneratedReports } from "./GeneratedReports";
import { CreateReportDialog } from "./CreateReportDialog";
import { AIReportGenerator } from "./AIReportGenerator";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ReportsDashboardProps {
  businessId?: string;
}

export const ReportsDashboard = ({ businessId }: ReportsDashboardProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  if (!businessId) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a business from your profile to access reports.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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

      <div className="grid gap-6 grid-cols-1">
        <AIReportGenerator 
          businessId={businessId} 
          onReportGenerated={(templateId) => {
            // Handle report generation completion if needed
          }} 
        />
        
        <Tabs defaultValue="templates" className="w-full">
          <TabsList>
            <TabsTrigger value="templates">Report Templates</TabsTrigger>
            <TabsTrigger value="generated">Generated Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="templates">
            <ReportTemplates businessId={businessId} />
          </TabsContent>
          <TabsContent value="generated">
            <GeneratedReports businessId={businessId} />
          </TabsContent>
        </Tabs>
      </div>

      <CreateReportDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        businessId={businessId}
      />
    </div>
  );
};
