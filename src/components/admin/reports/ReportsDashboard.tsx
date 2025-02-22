
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { CreateReportDialog } from "./CreateReportDialog";
import { AIReportGenerator } from "./AIReportGenerator";
import { GeneratedReports } from "./GeneratedReports";

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
          <h1 className="text-2xl font-bold text-eco-primary">ESG Performance Reports</h1>
          <p className="text-gray-500">Generate comprehensive ESG reports with visualizations</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">AI Report Generation</h2>
          <AIReportGenerator 
            businessId={businessId} 
            onReportGenerated={() => {
              // Handle report generation completion if needed
            }} 
          />
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold p-6 border-b">Generated Reports</h2>
          <GeneratedReports businessId={businessId} />
        </div>
      </div>

      <CreateReportDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        businessId={businessId}
      />
    </div>
  );
};
