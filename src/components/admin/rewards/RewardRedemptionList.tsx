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

interface RewardRedemption {
  id: string;
  user_id: string;
  tier_id: string;
  points_spent: number;
  status: string;
  redeemed_at: string;
  profiles: { name: string | null } | null;
  reward_tiers: { name: string | null } | null;
}

export const RewardRedemptionList = () => {
  const { data: redemptions } = useQuery({
    queryKey: ["reward-redemptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_redemptions")
        .select(`
          *,
          profiles:profiles!reward_redemptions_user_id_fkey(name),
          reward_tiers(name)
        `)
        .order("redeemed_at", { ascending: false });

      if (error) throw error;
      return data as unknown as RewardRedemption[];
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Recent Redemptions</h2>
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
                      ? "default"
                      : redemption.status === "rejected"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {redemption.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(redemption.redeemed_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};