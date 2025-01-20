import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface CarbonEmissionsFormProps {
  businessId: string;
  onSubmit?: () => void;
}

export const CarbonEmissionsForm = ({ businessId, onSubmit }: CarbonEmissionsFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    scope: "",
    emission_value: "",
    emission_source: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("carbon_emissions").insert({
        business_id: businessId,
        scope: formData.scope,
        emission_value: parseFloat(formData.emission_value),
        emission_source: formData.emission_source,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Carbon emissions data has been recorded.",
      });

      setFormData({
        scope: "",
        emission_value: "",
        emission_source: "",
      });

      if (onSubmit) onSubmit();
    } catch (error) {
      console.error("Error recording emissions:", error);
      toast({
        title: "Error",
        description: "Failed to record emissions data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Carbon Emissions</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Scope</label>
            <Select
              value={formData.scope}
              onValueChange={(value) => setFormData({ ...formData, scope: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select emission scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scope_1">Scope 1 (Direct Emissions)</SelectItem>
                <SelectItem value="scope_2">Scope 2 (Energy Indirect)</SelectItem>
                <SelectItem value="scope_3">Scope 3 (Value Chain)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Emission Value (kg CO₂e)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.emission_value}
              onChange={(e) => setFormData({ ...formData, emission_value: e.target.value })}
              placeholder="Enter emission value"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Source (Optional)</label>
            <Input
              value={formData.emission_source}
              onChange={(e) => setFormData({ ...formData, emission_source: e.target.value })}
              placeholder="Enter emission source"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Recording..." : "Record Emissions"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};