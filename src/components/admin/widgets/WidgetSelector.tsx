import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Filter } from "lucide-react";

interface Widget {
  id: string;
  name: string;
  description: string;
  category: 'environmental' | 'social' | 'governance';
  metric_type: string;
  unit: string;
}

export const WidgetSelector = ({ businessId }: { businessId: string }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {selectedCategory ? selectedCategory : "All Categories"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
              All Categories
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedCategory("environmental")}>
              Environmental
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedCategory("social")}>
              Social
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedCategory("governance")}>
              Governance
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-24 bg-gray-200 rounded" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {widgets?.map((widget) => (
            <Card key={widget.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{widget.name}</h3>
                  <p className="text-sm text-gray-500">{widget.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Metric: {widget.metric_type} ({widget.unit})
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => addWidget(widget.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};