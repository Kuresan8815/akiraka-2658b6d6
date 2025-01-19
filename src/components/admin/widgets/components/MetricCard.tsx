import { BusinessWidget } from "@/types/widgets";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Trash2, GripVertical } from "lucide-react";

interface MetricCardProps {
  businessWidget: BusinessWidget;
  metricValue: string;
  onMetricChange: (value: string) => void;
  onUpdate: () => void;
  onRemove: () => void;
}

export const MetricCard = ({
  businessWidget,
  metricValue,
  onMetricChange,
  onUpdate,
  onRemove,
}: MetricCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-center mb-2">
        <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
        <h3 className="font-semibold">{businessWidget.widget.name}</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">{businessWidget.widget.description}</p>
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder={`Enter value (${businessWidget.widget.unit})`}
          value={metricValue}
          onChange={(e) => onMetricChange(e.target.value)}
        />
        <Button
          size="icon"
          variant="outline"
          onClick={onUpdate}
        >
          <Save className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="text-red-500 hover:text-red-600"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};