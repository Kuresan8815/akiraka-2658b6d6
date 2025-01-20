import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Trash2, Save } from "lucide-react";
import { format } from "date-fns";

interface MetricRow {
  id: string;
  name: string;
  unit: string;
  value: number;
  lastUpdated: string;
  isEditing?: boolean;
}

export const DataEntryTable = ({ category }: { category: string }) => {
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const { toast } = useToast();

  const { isLoading } = useQuery({
    queryKey: ["metrics", category],
    queryFn: async () => {
      const { data: widgets, error } = await supabase
        .from("widgets")
        .select("*")
        .eq("category", category)
        .eq("is_active", true);

      if (error) throw error;

      const formattedMetrics = widgets.map((widget) => ({
        id: widget.id,
        name: widget.name,
        unit: widget.unit || "-",
        value: 0,
        lastUpdated: new Date().toISOString(),
      }));

      setMetrics(formattedMetrics);
      return widgets;
    },
  });

  const handleEdit = (id: string) => {
    setMetrics(
      metrics.map((metric) =>
        metric.id === id ? { ...metric, isEditing: true } : metric
      )
    );
  };

  const handleSave = async (id: string) => {
    try {
      const metric = metrics.find((m) => m.id === id);
      if (!metric) return;

      const { error } = await supabase.from("widget_metrics").insert({
        widget_id: id,
        value: metric.value,
        business_id: "your-business-id", // This should be dynamic based on context
      });

      if (error) throw error;

      setMetrics(
        metrics.map((m) =>
          m.id === id
            ? { ...m, isEditing: false, lastUpdated: new Date().toISOString() }
            : m
        )
      );

      toast({
        title: "Success",
        description: "Metric value has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update metric value",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("widget_metrics")
        .delete()
        .eq("widget_id", id);

      if (error) throw error;

      setMetrics(metrics.filter((metric) => metric.id !== id));

      toast({
        title: "Success",
        description: "Metric has been deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete metric",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metric Name</TableHead>
            <TableHead>Unit of Measure</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((metric) => (
            <TableRow key={metric.id}>
              <TableCell>{metric.name}</TableCell>
              <TableCell>{metric.unit}</TableCell>
              <TableCell>
                {metric.isEditing ? (
                  <Input
                    type="number"
                    value={metric.value}
                    onChange={(e) =>
                      setMetrics(
                        metrics.map((m) =>
                          m.id === metric.id
                            ? { ...m, value: parseFloat(e.target.value) }
                            : m
                        )
                      )
                    }
                    className="w-24"
                  />
                ) : (
                  metric.value
                )}
              </TableCell>
              <TableCell>
                {format(new Date(metric.lastUpdated), "MMM d, yyyy HH:mm")}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {metric.isEditing ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSave(metric.id)}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(metric.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(metric.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};