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
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {businessWidgets?.map((bw) => (
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