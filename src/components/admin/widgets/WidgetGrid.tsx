import { WidgetDisplay } from "./WidgetDisplay";
import { WidgetGridSkeleton } from "./WidgetGridSkeleton";
import { useWidgetData } from "@/hooks/useWidgetData";
import { Card } from "@/components/ui/card";
import { BusinessWidget } from "@/types/widgets";

interface WidgetGridProps {
  businessId: string;
  category?: "environmental" | "social" | "governance";
  activeWidgets?: BusinessWidget[];
}

export const WidgetGrid = ({ businessId, category, activeWidgets }: WidgetGridProps) => {
  const { metrics, isLoading, error } = useWidgetData(businessId, category);

  if (error) {
    return (
      <Card className="p-4 text-center text-red-500">
        <p>Error loading widgets: {error.message}</p>
      </Card>
    );
  }

  if (isLoading) {
    return <WidgetGridSkeleton />;
  }

  if (!activeWidgets?.length) {
    return (
      <Card className="p-4 text-center text-gray-500">
        <p>No widgets available for this category.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {activeWidgets.map((bw) => (
        <WidgetDisplay
          key={bw.id}
          widget={bw.widget}
          value={metrics?.get(bw.widget_id)}
        />
      ))}
    </div>
  );
};