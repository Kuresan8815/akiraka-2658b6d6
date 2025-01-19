import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Widget } from "@/types/widgets";

interface WidgetDisplayProps {
  widget: Widget;
  value?: number;
}

export const WidgetDisplay = ({ widget, value }: WidgetDisplayProps) => {
  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="bg-eco-secondary/10">
        <CardTitle className="text-lg font-semibold text-eco-primary">
          {widget.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-2xl font-bold text-eco-primary">
          {value?.toLocaleString() || '0'} {widget.unit}
        </div>
        <p className="text-sm text-gray-600 mt-2">{widget.description}</p>
      </CardContent>
    </Card>
  );
};