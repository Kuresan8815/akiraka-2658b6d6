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
    </div>
  );
};

export default Profile;