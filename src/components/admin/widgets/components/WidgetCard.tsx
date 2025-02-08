import { Widget } from "@/types/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface WidgetCardProps {
  widget: Widget;
  onAdd: (widgetId: string) => void;
}

export const WidgetCard = ({ widget, onAdd }: WidgetCardProps) => {
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
          onClick={() => onAdd(widget.id)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};