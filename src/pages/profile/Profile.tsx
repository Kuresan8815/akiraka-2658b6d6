import React from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileForm } from '@/components/profile/ProfileForm';

export const Profile = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <ProfileHeader />
      <ProfileForm />
    </div>
  );
};

export default Profile;