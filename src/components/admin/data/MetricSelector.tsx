import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Widget } from "@/types/widgets";

interface MetricSelectorProps {
  availableMetrics: Widget[] | undefined;
  selectedMetricId: string;
  onMetricSelect: (id: string) => void;
}

export const MetricSelector = ({
  availableMetrics,
  selectedMetricId,
  onMetricSelect,
}: MetricSelectorProps) => {
  return (
    <Select value={selectedMetricId} onValueChange={onMetricSelect}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a metric" />
      </SelectTrigger>
      <SelectContent>
        {availableMetrics?.map((metric) => (
          <SelectItem key={metric.id} value={metric.id}>
            {metric.name} ({metric.unit || 'units'})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};