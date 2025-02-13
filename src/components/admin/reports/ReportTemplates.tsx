
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportTemplate } from "@/types/reports";
import { BarChart3, FileText, PieChart, Table, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ReportTemplatesProps {
  businessId?: string;
}

export const ReportTemplates = ({ businessId }: ReportTemplatesProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["report-templates", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_templates")
        .select("*")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data as any[]).map(template => ({
        ...template,
        visualization_config: template.visualization_config ? {
          showBarCharts: template.visualization_config.showBarCharts ?? true,
          showPieCharts: template.visualization_config.showPieCharts ?? true,
          showTables: template.visualization_config.showTables ?? true,
          showTimeline: template.visualization_config.showTimeline ?? true,
        } : {
          showBarCharts: true,
          showPieCharts: true,
          showTables: true,
          showTimeline: true,
        },
        included_metrics: template.included_metrics || [],
        theme_colors: template.theme_colors || [],
      })) as ReportTemplate[];
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async (template: ReportTemplate) => {
      // First create a report record
      const { data: report, error: reportError } = await supabase
        .from("generated_reports")
        .insert([
          {
            template_id: template.id,
            business_id: businessId,
            status: 'pending',
            generated_by: (await supabase.auth.getUser()).data.user?.id,
            date_range: {
              start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
              end: new Date().toISOString(),
            },
            metadata: {
              template_name: template.name,
              template_type: template.report_type,
              visualization_config: template.visualization_config,
            }
          }
        ])
        .select()
        .single();

      if (reportError) throw reportError;

      // Then trigger the report generation
      if (template.report_type === 'esg') {
        const { error: fnError } = await supabase.functions.invoke('generate-esg-report', {
          body: { 
            businessId: businessId,
            dateRange: report.date_range,
          }
        });
        if (fnError) throw fnError;
      } else {
        const { error: fnError } = await supabase.functions.invoke('generate-report', {
          body: { report_id: report.id }
        });
        if (fnError) throw fnError;
      }

      return report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-reports'] });
      toast({
        title: "Report Generation Started",
        description: "Your report is being generated. You'll be notified when it's ready.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate report: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleGenerateReport = async (template: ReportTemplate) => {
    generateReportMutation.mutate(template);
  };

  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  if (!templates?.length) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <CardTitle>No report templates</CardTitle>
            <CardDescription>
              Create your first report template to get started
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
                <div className="mt-2 text-sm text-muted-foreground">
                  Type: {template.report_type.charAt(0).toUpperCase() + template.report_type.slice(1)}
                </div>
              </div>
              {template.layout_type === "infographic" ? (
                <BarChart3 className="h-5 w-5 text-eco-primary" />
              ) : (
                <FileText className="h-5 w-5 text-eco-primary" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {template.theme_colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                {template.visualization_config?.showBarCharts && (
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                )}
                {template.visualization_config?.showPieCharts && (
                  <PieChart className="h-4 w-4 text-gray-500" />
                )}
                {template.visualization_config?.showTables && (
                  <Table className="h-4 w-4 text-gray-500" />
                )}
                {template.visualization_config?.showTimeline && (
                  <LineChart className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <Button 
                onClick={() => handleGenerateReport(template)}
                disabled={generateReportMutation.isPending}
                className="w-full"
              >
                {generateReportMutation.isPending ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
