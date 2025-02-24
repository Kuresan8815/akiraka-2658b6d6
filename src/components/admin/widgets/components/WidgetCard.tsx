
import { Widget } from "@/types/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface WidgetCardProps {
  widget: Widget;
  onAdd: (widgetId: string) => void;
  businessId: string;
}

export const WidgetCard = ({ widget, onAdd, businessId }: WidgetCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleActivate = async () => {
    try {
      // First check if the widget already exists for this business
      const { data: existingWidget } = await supabase
        .from("business_widgets")
        .select("id")
        .eq("business_id", businessId)
        .eq("widget_id", widget.id)
        .single();

      if (existingWidget) {
        // If it exists, update it to active
        const { error } = await supabase
          .from("business_widgets")
          .update({ is_active: true })
          .eq("id", existingWidget.id);

        if (error) throw error;
      } else {
        // If it doesn't exist, insert a new record
        const { data: businessWidgets } = await supabase
          .from("business_widgets")
          .select("position")
          .eq("business_id", businessId)
          .order("position", { ascending: false })
          .limit(1);

        const nextPosition = (businessWidgets?.[0]?.position ?? 0) + 1;

        const { error } = await supabase
          .from("business_widgets")
          .insert({
            business_id: businessId,
            widget_id: widget.id,
            position: nextPosition,
            is_active: true,
          });

        if (error) throw error;
      }

      // Refresh queries to update the UI
      queryClient.invalidateQueries({ queryKey: ["business-widgets"] });
      queryClient.invalidateQueries({ queryKey: ["active-metrics"] });

      toast({
        title: "Success",
        description: `${widget.name} has been activated`,
      });

      onAdd(widget.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4">
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
          onClick={handleActivate}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
