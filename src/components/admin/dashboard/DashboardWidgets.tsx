import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WidgetGrid } from "../widgets/WidgetGrid";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardWidgetsProps {
  businessId: string;
}

export const DashboardWidgets = ({ businessId }: DashboardWidgetsProps) => {
  const { data: activeCategories } = useQuery({
    queryKey: ["widget-categories", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_widgets")
        .select(`
          widget:widgets(category)
        `)
        .eq("business_id", businessId)
        .eq("is_active", true);

      if (error) throw error;

      const categories = [...new Set(data.map(item => item.widget.category))];
      return categories;
    },
  });

  if (!activeCategories?.length) {
    return null;
  }

  return (
    <Tabs defaultValue={activeCategories[0]} className="w-full">
      <TabsList>
        {activeCategories.map((category) => (
          <TabsTrigger key={category} value={category}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </TabsTrigger>
        ))}
      </TabsList>
      {activeCategories.map((category) => (
        <TabsContent key={category} value={category}>
          <WidgetGrid 
            businessId={businessId} 
            category={category} 
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};