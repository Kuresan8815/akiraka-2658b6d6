import { WidgetDisplay } from "./WidgetDisplay";
import { WidgetGridSkeleton } from "./WidgetGridSkeleton";
import { useWidgetData } from "@/hooks/useWidgetData";
import { Card } from "@/components/ui/card";

interface WidgetGridProps {
  businessId: string;
  category?: "environmental" | "social" | "governance";
}

export const WidgetGrid = ({ businessId, category }: WidgetGridProps) => {
  const { widgets, businessWidgets, metrics, isLoading, error } = useWidgetData(businessId, category);

  if (error) {
    return (
      <Card className="p-4 text-center text-red-500">
        <p>Error loading widgets. Please try again later.</p>
      </Card>
    );
  }

  if (isLoading) {
    return <WidgetGridSkeleton />;
  }

  const activeWidgets = widgets?.filter(widget => 
    businessWidgets?.includes(widget.id)
  );

  if (!activeWidgets?.length) {
    return (
      <Card className="p-4 text-center text-gray-500">
        <p>No widgets available for this category.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {activeWidgets?.map((widget) => (
        <WidgetDisplay
          key={widget.id}
          widget={widget}
          value={metrics?.get(widget.id)}
        />
      ))}
    </div>
  );
};