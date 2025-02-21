
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserInteraction {
  total_scans: number;
  total_purchases: number;
  last_interaction: string;
  user_id: string;
  user_name: string | null;
}

export const UsersList = () => {
  const { data: userInteractions, isLoading } = useQuery({
    queryKey: ['user-interactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Get the business ID for the current admin
      const { data: businessProfile } = await supabase
        .from('business_profiles')
        .select('business_id')
        .eq('user_id', user.id)
        .single();

      if (!businessProfile) throw new Error('No business profile found');

      // Get all user interactions with profiles for this business using separate queries
      const { data: statsData } = await supabase
        .from('user_merchant_stats')
        .select('*')
        .eq('business_id', businessProfile.business_id);

      if (!statsData) return [];

      // Get profiles for all users
      const userIds = statsData.map(stat => stat.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);

      // Combine the data
      return statsData.map(stat => {
        const profile = profilesData?.find(p => p.id === stat.user_id);
        return {
          total_scans: stat.total_scans,
          total_purchases: stat.total_purchases,
          last_interaction: stat.last_interaction,
          user_id: stat.user_id,
          user_name: profile?.name || 'N/A'
        };
      });
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Interactions</CardTitle>
        </CardHeader>
        <CardContent>
          Loading user data...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Interactions</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Total Scans</TableHead>
                <TableHead>Total Purchases</TableHead>
                <TableHead>Last Interaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userInteractions?.map((interaction) => (
                <TableRow key={interaction.user_id}>
                  <TableCell>{interaction.user_name}</TableCell>
                  <TableCell>{interaction.total_scans}</TableCell>
                  <TableCell>{interaction.total_purchases}</TableCell>
                  <TableCell>
                    {new Date(interaction.last_interaction).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
