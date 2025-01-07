import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useToast } from '@/components/ui/use-toast';
import { Profile as ProfileType } from '@/types/profile';

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
      
      return {
        ...data,
        email: user.email,
      } as ProfileType;
    },
  });

  const handleSubmit = async (formData: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
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