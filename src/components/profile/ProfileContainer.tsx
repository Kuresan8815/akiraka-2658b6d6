import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileForm } from "./ProfileForm";
import { BusinessProfileManager } from "@/components/business/BusinessProfileManager";
import { ProfileFormData, ProfilePreferences } from "@/types/profile";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
import { fetchUserProfile, updateUserProfile, updateUserPreferences } from "@/utils/profile";

export const ProfileContainer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      if (!session?.user?.id) throw new Error("No user ID");
      return fetchUserProfile(session.user.id);
    },
  });

  const handleUpdateProfile = async (formData: ProfileFormData) => {
    if (!session?.user?.id) return;

    try {
      await updateUserProfile(session.user.id, formData.name, formData.sustainabilityGoals);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    }
  };

  const handleUpdatePreferences = async (preferences: ProfilePreferences) => {
    if (!session?.user?.id) return;

    try {
      await updateUserPreferences(session.user.id, preferences);

      toast({
        title: "Preferences updated",
        description: "Your preferences have been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update preferences. Please try again.",
      });
    }
  };

  if (!session) {
    navigate("/login");
    return null;
  }

  if (isProfileLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <ProfileHeader 
        avatarUrl={profile.avatar_url}
        name={profile.name}
        email={profile.email}
      />
      
      <Card className="p-6">
        <ProfileForm
          profile={profile}
          isEditing={isEditing}
          onSubmit={handleUpdateProfile}
          onEdit={() => setIsEditing(true)}
          onCancel={() => setIsEditing(false)}
        />
      </Card>

      <Card className="p-6">
        <NotificationPreferences 
          preferences={profile.preferences}
          onUpdate={handleUpdatePreferences}
        />
      </Card>

      <BusinessProfileManager />
    </div>
  );
};