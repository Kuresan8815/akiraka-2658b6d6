
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportTemplate } from "@/types/reports";
import { BarChart3, FileText } from "lucide-react";

interface ReportTemplatesProps {
  businessId?: string;
}

export const ReportTemplates = ({ businessId }: ReportTemplatesProps) => {
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
      return data as ReportTemplate[];
    },
  });

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
              </div>
              {template.layout_type === "infographic" ? (
                <BarChart3 className="h-5 w-5 text-eco-primary" />
              ) : (
                <FileText className="h-5 w-5 text-eco-primary" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {template.theme_colors.map((color, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
