import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Widget } from "@/types/widgets";
import { useState } from "react";
import { MetricDetailsModal } from "./MetricDetailsModal";

interface WidgetDisplayProps {
  widget: Widget;
  value?: number;
}

export const WidgetDisplay = ({ widget, value }: WidgetDisplayProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card 
        className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
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

      <MetricDetailsModal
        widget={widget}
        value={value}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};