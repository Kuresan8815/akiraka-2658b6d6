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
import { Switch } from "@/components/ui/switch";
import { Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RewardTierListProps {
  onEdit: (tier: any) => void;
}

export const RewardTierList = ({ onEdit }: RewardTierListProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const { data: tiers, refetch } = useQuery({
    queryKey: ["reward-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_tiers")
        .select("*")
        .order("points_required", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setLoading(id);
    try {
      await supabase
        .from("reward_tiers")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      refetch();
      toast({
        title: "Success",
        description: `Reward tier ${currentStatus ? "deactivated" : "activated"} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reward tier status",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reward tier?")) return;

    setLoading(id);
    try {
      await supabase
        .from("reward_tiers")
        .delete()
        .eq("id", id);
      refetch();
      toast({
        title: "Success",
        description: "Reward tier deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete reward tier",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Points Required</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Active</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tiers?.map((tier) => (
          <TableRow key={tier.id}>
            <TableCell>{tier.name}</TableCell>
            <TableCell>{tier.points_required}</TableCell>
            <TableCell className="capitalize">{tier.reward_type}</TableCell>
            <TableCell>{tier.reward_value}</TableCell>
            <TableCell>
              <Switch
                checked={tier.is_active}
                disabled={loading === tier.id}
                onCheckedChange={() => handleToggleActive(tier.id, tier.is_active)}
              />
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(tier)}
                  disabled={loading === tier.id}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(tier.id)}
                  disabled={loading === tier.id}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};