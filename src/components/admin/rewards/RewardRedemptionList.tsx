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
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const RewardRedemptionList = () => {
  const { toast } = useToast();

  const { data: redemptions, refetch } = useQuery({
    queryKey: ["reward-redemptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_redemptions")
        .select(`
          *,
          reward_tiers (name, reward_type, reward_value),
          profiles (name)
        `)
        .order("redeemed_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await supabase
        .from("reward_redemptions")
        .update({ status: newStatus })
        .eq("id", id);
      refetch();
      toast({
        title: "Success",
        description: "Redemption status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update redemption status",
        variant: "destructive",
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Reward</TableHead>
          <TableHead>Points Spent</TableHead>
          <TableHead>Redeemed At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {redemptions?.map((redemption) => (
          <TableRow key={redemption.id}>
            <TableCell>{redemption.profiles?.name}</TableCell>
            <TableCell>
              {redemption.reward_tiers?.name} ({redemption.reward_tiers?.reward_value})
            </TableCell>
            <TableCell>{redemption.points_spent}</TableCell>
            <TableCell>
              {format(new Date(redemption.redeemed_at), "MMM d, yyyy HH:mm")}
            </TableCell>
            <TableCell className="capitalize">{redemption.status}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                {redemption.status === "pending" && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleUpdateStatus(redemption.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUpdateStatus(redemption.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {redemption.status === "approved" && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleUpdateStatus(redemption.id, "completed")}
                  >
                    Mark Complete
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};