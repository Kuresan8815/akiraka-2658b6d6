import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const ManualDataEntry = () => {
  const [value, setValue] = useState("");
  const [selectedWidget, setSelectedWidget] = useState("");
  const { toast } = useToast();

  const { data: widgets, isLoading } = useQuery({
    queryKey: ["widgets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("widgets")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from("widget_metrics")
        .insert({
          widget_id: selectedWidget,
          value: parseFloat(value),
          business_id: "your-business-id", // This should be dynamic based on context
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Metric value has been saved",
      });

      setValue("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save metric value",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Select Metric</label>
        <select
          className="w-full p-2 border rounded-md"
          value={selectedWidget}
          onChange={(e) => setSelectedWidget(e.target.value)}
          required
        >
          <option value="">Select a metric</option>
          {widgets?.map((widget) => (
            <option key={widget.id} value={widget.id}>
              {widget.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Value</label>
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter metric value"
          required
        />
      </div>

      <Button type="submit">Save Metric</Button>
    </form>
  );
};