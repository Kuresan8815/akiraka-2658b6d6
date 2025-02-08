import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useWidgetCategories = (businessId: string) => {
  return useQuery({
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
    staleTime: 30000,
    retry: 2,
  });
};