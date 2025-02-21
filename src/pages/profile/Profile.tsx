
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useToast } from '@/components/ui/use-toast';
import { Profile as ProfileType, ProfilePreferences } from '@/types/profile';

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!data) throw new Error('No profile found');

      // Parse the preferences with proper type checking
      const defaultPreferences: ProfilePreferences = {
        notifications: false,
        darkTheme: false,
      };

      const preferences = data.preferences as Record<string, unknown> || {};
      const parsedPreferences: ProfilePreferences = {
        notifications: typeof preferences.notifications === 'boolean' ? preferences.notifications : defaultPreferences.notifications,
        darkTheme: typeof preferences.darkTheme === 'boolean' ? preferences.darkTheme : defaultPreferences.darkTheme,
      };
      
      return {
        ...data,
        email: user.email,
        preferences: parsedPreferences,
        sustainability_goals: Array.isArray(data.sustainability_goals) ? data.sustainability_goals : [],
      } as ProfileType;
    },
  });

  const { data: merchantInteractions } = useQuery({
    queryKey: ['merchant-interactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('user_merchant_stats')
        .select(`
          total_scans,
          total_purchases,
          last_interaction,
          businesses:business_id (
            id,
            name
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      return data.map(interaction => ({
        business_id: interaction.businesses?.id,
        business_name: interaction.businesses?.name,
        total_scans: interaction.total_scans,
        total_purchases: interaction.total_purchases,
        last_interaction: interaction.last_interaction
      }));
    }
  });

  const handleSubmit = async (formData: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          sustainability_goals: formData.sustainabilityGoals,
          preferences: {
            notifications: formData.notifications,
            darkTheme: formData.darkTheme,
          },
        })
        .eq('id', profile?.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  if (!profile) return null;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <ProfileHeader />
      <ProfileForm
        profile={profile}
        isEditing={isEditing}
        onSubmit={handleSubmit}
        onEdit={() => setIsEditing(true)}
        onCancel={() => setIsEditing(false)}
      />
      
      {/* Merchant Interactions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Merchant Interactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Total Scans</TableHead>
                  <TableHead>Total Purchases</TableHead>
                  <TableHead>Last Interaction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {merchantInteractions?.map((interaction) => (
                  <TableRow key={interaction.business_id}>
                    <TableCell>{interaction.business_name}</TableCell>
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
    </div>
  );
};

export default Profile;
