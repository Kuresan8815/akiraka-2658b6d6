import { WidgetDisplay } from "./WidgetDisplay";
import { WidgetGridSkeleton } from "./WidgetGridSkeleton";
import { useWidgetData } from "@/hooks/useWidgetData";

interface WidgetGridProps {
  businessId: string;
  category?: string;
}

export const WidgetGrid = ({ businessId, category }: WidgetGridProps) => {
  const { widgets, businessWidgets, metrics, isLoading } = useWidgetData(businessId, category);

  if (isLoading) {
    return <WidgetGridSkeleton />;
  }

  const activeWidgets = widgets?.filter(widget => 
    businessWidgets?.includes(widget.id)
  );

  if (!activeWidgets?.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No widgets available for this category.</p>
      </div>
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