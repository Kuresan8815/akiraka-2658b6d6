
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
  user_email: string;
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

      // First get all user interactions for this business
      const { data: statsData, error } = await supabase
        .from('user_merchant_stats')
        .select(`
          total_scans,
          total_purchases,
          last_interaction,
          user_id,
          user:user_id (
            profile:profiles (
              name
            )
          )
        `)
        .eq('business_id', businessProfile.business_id);

      if (error) throw error;

      // Get the session info for each user - we'll need to do this one by one
      // since we can't access auth.users table directly
      const enrichedData = await Promise.all(
        statsData.map(async (stat) => {
          // Get the user's profile data from our public profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', stat.user_id)
            .single();

          return {
            total_scans: stat.total_scans,
            total_purchases: stat.total_purchases,
            last_interaction: stat.last_interaction,
            user_id: stat.user_id,
            user_name: profileData?.name || 'N/A',
            user_email: profileData?.email || 'N/A'
          };
        })
      );

      return enrichedData;
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
                <TableHead>Email</TableHead>
                <TableHead>Total Scans</TableHead>
                <TableHead>Total Purchases</TableHead>
                <TableHead>Last Interaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userInteractions?.map((interaction) => (
                <TableRow key={interaction.user_id}>
                  <TableCell>{interaction.user_name || 'N/A'}</TableCell>
                  <TableCell>{interaction.user_email}</TableCell>
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
