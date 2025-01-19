import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  industry_type: string;
  widget_ids: string[];
}

export const TemplateSelector = ({ businessId }: { businessId: string }) => {
  const { toast } = useToast();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["industry-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industry_templates")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data as Template[];
    },
  });

  const applyTemplate = async (template: Template) => {
    try {
      // First, get the current highest position
      const { data: existingWidgets } = await supabase
        .from("business_widgets")
        .select("position")
        .eq("business_id", businessId)
        .order("position", { ascending: false })
        .limit(1);

      let nextPosition = existingWidgets?.[0]?.position ?? 0;

      // Create widget entries for each widget in the template
      const widgetEntries = template.widget_ids.map((widgetId) => ({
        business_id: businessId,
        widget_id: widgetId,
        position: ++nextPosition,
      }));

      const { error } = await supabase
        .from("business_widgets")
        .insert(widgetEntries);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Template "${template.name}" applied successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Industry Templates</h2>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-24 bg-gray-200 rounded" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates?.map((template) => (
            <Card key={template.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Industry: {template.industry_type}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => applyTemplate(template)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};