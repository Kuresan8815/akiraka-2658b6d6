import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Widget } from "@/types/widgets";
import { CategoryFilter } from "./components/CategoryFilter";
import { WidgetCard } from "./components/WidgetCard";

export const WidgetSelector = ({ businessId }: { businessId: string }) => {
  const [selectedCategory, setSelectedCategory] = useState<'environmental' | 'social' | 'governance' | null>(null);
  const { toast } = useToast();

  const { data: widgets, isLoading } = useQuery({
    queryKey: ["widgets", selectedCategory],
    queryFn: async () => {
      const query = supabase
        .from("widgets")
        .select("*")
        .eq("is_active", true);

      if (selectedCategory) {
        query.eq("category", selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Widget[];
    },
  });

  const addWidget = async (widgetId: string) => {
    try {
      const { data: existingWidgets } = await supabase
        .from("business_widgets")
        .select("position")
        .eq("business_id", businessId)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition = existingWidgets?.[0]?.position ?? 0;

      const { error } = await supabase
        .from("business_widgets")
        .insert({
          business_id: businessId,
          widget_id: widgetId,
          position: nextPosition + 1,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Widget added successfully",
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Available Widgets</h2>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {widgets?.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              onAdd={addWidget}
            />
          ))}
        </div>
      )}
    </div>
  );
};