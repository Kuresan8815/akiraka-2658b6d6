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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const RewardRedemptionList = () => {
  const { data: redemptions, isLoading } = useQuery({
    queryKey: ["reward-redemptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_redemptions")
        .select(`
          *,
          reward_tiers (
            name,
            points_required,
            reward_type,
            reward_value
          ),
          profiles (
            name
          )
        `)
        .order("redeemed_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recent Redemptions</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Reward</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {redemptions?.map((redemption) => (
            <TableRow key={redemption.id}>
              <TableCell>{redemption.profiles?.name || "Unknown User"}</TableCell>
              <TableCell>{redemption.reward_tiers.name}</TableCell>
              <TableCell>{redemption.points_spent}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    redemption.status === "completed"
                      ? "default"
                      : redemption.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {redemption.status}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(redemption.redeemed_at), "MMM d, yyyy")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};