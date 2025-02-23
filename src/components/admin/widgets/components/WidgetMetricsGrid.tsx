
import { BusinessWidget } from "@/types/widgets";
import { MetricCard } from "./MetricCard";

interface WidgetMetricsGridProps {
  businessWidgets: BusinessWidget[] | null;
  metrics: Record<string, string>;
  onMetricChange: (widgetId: string, value: string) => void;
  onUpdate: (widgetId: string) => void;
  onRemove: (widgetId: string) => void;
}

export const WidgetMetricsGrid = ({
  businessWidgets,
  metrics,
  onMetricChange,
  onUpdate,
  onRemove,
}: WidgetMetricsGridProps) => {
  if (!businessWidgets) {
    return <div>No widgets found</div>;
  }

  // Filter out any null widgets and ensure widget property exists
  const validBusinessWidgets = businessWidgets.filter(
    (bw): bw is BusinessWidget => bw !== null && bw.widget !== null
  );

  if (validBusinessWidgets.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No active metrics found. Add metrics from the "Add Metrics" tab.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {validBusinessWidgets.map((bw) => (
        <MetricCard
          key={bw.id}
          businessWidget={bw}
          metricValue={metrics[bw.widget.id] || ""}
          onMetricChange={(value) => onMetricChange(bw.widget.id, value)}
          onUpdate={() => onUpdate(bw.widget.id)}
          onRemove={() => onRemove(bw.widget.id)}
        />
      ))}
    </div>
  );
};
