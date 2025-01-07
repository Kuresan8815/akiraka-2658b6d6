import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RewardTierFormProps {
  onSuccess: () => void;
  initialData?: {
    id: string;
    name: string;
    points_required: number;
    reward_type: 'discount' | 'voucher' | 'product' | 'service';
    reward_value: string;
    description?: string;
  };
}

export const RewardTierForm = ({ onSuccess, initialData }: RewardTierFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    points_required: initialData?.points_required || 0,
    reward_type: initialData?.reward_type || "discount",
    reward_value: initialData?.reward_value || "",
    description: initialData?.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData?.id) {
        await supabase
          .from("reward_tiers")
          .update(formData)
          .eq("id", initialData.id);
      } else {
        await supabase
          .from("reward_tiers")
          .insert([formData]);
      }

      toast({
        title: "Success",
        description: `Reward tier ${initialData ? "updated" : "created"} successfully`,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save reward tier",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Points Required</label>
        <Input
          type="number"
          value={formData.points_required}
          onChange={(e) => setFormData({ ...formData, points_required: parseInt(e.target.value) })}
          required
          min={0}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Reward Type</label>
        <Select
          value={formData.reward_type}
          onValueChange={(value) => setFormData({ ...formData, reward_type: value as any })}
        >
          <option value="discount">Discount</option>
          <option value="voucher">Voucher</option>
          <option value="product">Product</option>
          <option value="service">Service</option>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Reward Value</label>
        <Input
          value={formData.reward_value}
          onChange={(e) => setFormData({ ...formData, reward_value: e.target.value })}
          required
          placeholder="e.g., 10% off, Free Product, etc."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the reward..."
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : initialData ? "Update Reward Tier" : "Create Reward Tier"}
      </Button>
    </form>
  );
};