import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const RewardRedemptionList = () => {
  const { data: redemptions, isLoading } = useQuery({
    queryKey: ["rewardRedemptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_redemptions")
        .select("*, profiles(name), reward_tiers(name)")
        .order("redeemed_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleUpdateStatus = async (id: string, status: string) => {
    await supabase
      .from("reward_redemptions")
      .update({ status })
      .eq("id", id);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recent Redemptions</h3>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Reward</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {redemptions?.map((redemption) => (
            <TableRow key={redemption.id}>
              <TableCell>
                {redemption.profiles?.name || "Unknown User"}
              </TableCell>
              <TableCell>
                {redemption.reward_tiers?.name || "Unknown Reward"}
              </TableCell>
              <TableCell>{redemption.points_spent}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    redemption.status === "approved"
                      ? "success"
                      : redemption.status === "rejected"
                      ? "destructive"
                      : "default"
                  }
                >
                  {redemption.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(redemption.id, "approved")}
                    disabled={redemption.status !== "pending"}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(redemption.id, "rejected")}
                    disabled={redemption.status !== "pending"}
                  >
                    Reject
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
