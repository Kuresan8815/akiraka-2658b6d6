import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Template } from "@/types/widgets";
import { TemplateCard } from "./components/TemplateCard";

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
      const { data: existingWidgets } = await supabase
        .from("business_widgets")
        .select("position")
        .eq("business_id", businessId)
        .order("position", { ascending: false })
        .limit(1);

      let nextPosition = existingWidgets?.[0]?.position ?? 0;

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
            <div key={i} className="p-4 animate-pulse">
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates?.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onApply={applyTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
};