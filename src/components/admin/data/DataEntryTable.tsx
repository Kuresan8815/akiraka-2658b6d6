import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MetricRowComponent } from "./MetricRow";
import { MetricCategory, MetricRow } from "@/types/metrics";

export const DataEntryTable = ({ category }: { category: MetricCategory }) => {
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const { toast } = useToast();

  const handleEdit = (id: string) => {
    setMetrics(
      metrics.map((metric) =>
        metric.id === id ? { ...metric, isEditing: true } : metric
      )
    );
  };

  const handleSave = (id: string, value: string) => {
    setMetrics(
      metrics.map((metric) =>
        metric.id === id
          ? {
              ...metric,
              value,
              isEditing: false,
              lastUpdated: new Date().toISOString(),
            }
          : metric
      )
    );
    toast({
      title: "Success",
      description: "Metric value updated successfully",
    });
  };

  const handleCancel = (id: string) => {
    setMetrics(
      metrics.map((metric) =>
        metric.id === id ? { ...metric, isEditing: false } : metric
      )
    );
  };

  const handleDelete = (id: string) => {
    setMetrics(metrics.filter((metric) => metric.id !== id));
    toast({
      title: "Success",
      description: "Metric deleted successfully",
    });
  };

  const handleValueChange = (id: string, value: string) => {
    setMetrics(
      metrics.map((metric) =>
        metric.id === id ? { ...metric, value } : metric
      )
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Metric Name</th>
            <th className="px-4 py-2 text-left">Unit of Measure</th>
            <th className="px-4 py-2 text-left">Value</th>
            <th className="px-4 py-2 text-left">Last Updated</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => (
            <MetricRowComponent
              key={metric.id}
              metric={metric}
              onEdit={handleEdit}
              onSave={handleSave}
              onCancel={handleCancel}
              onDelete={handleDelete}
              onValueChange={handleValueChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};