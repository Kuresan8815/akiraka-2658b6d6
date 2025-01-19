import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WidgetGrid } from "../widgets/WidgetGrid";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardWidgetsProps {
  businessId: string;
}

export const DashboardWidgets = ({ businessId }: DashboardWidgetsProps) => {
  const { data: activeCategories, isLoading } = useQuery({
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
    staleTime: 30000, // Cache data for 30 seconds
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-[300px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

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