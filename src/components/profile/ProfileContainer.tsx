import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileForm } from "./ProfileForm";
import { BusinessProfileManager } from "@/components/business/BusinessProfileManager";
import { Profile as ProfileType, ProfileFormData, ProfilePreferences } from "@/types/profile";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
import { Json } from "@/integrations/supabase/types";

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
      const { data, error } = await supabase
        .from("profiles")
        .select("*, users:auth.users(email)")
        .eq("id", session?.user?.id)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        email: data.users.email,
      } as ProfileType;
    },
  });

  const handleUpdateProfile = async (formData: ProfileFormData) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          sustainability_goals: formData.sustainabilityGoals,
        })
        .eq("id", session.user.id);

      if (error) throw error;

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
      const { error } = await supabase
        .from("profiles")
        .update({
          preferences: preferences as Json,
        })
        .eq("id", session.user.id);

      if (error) throw error;

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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <ProfileHeader 
        avatarUrl={profile?.avatar_url}
        name={profile?.name}
        email={profile?.email}
      />
      
      <Card className="p-6">
        <ProfileForm
          profile={profile!}
          isEditing={isEditing}
          onSubmit={handleUpdateProfile}
          onEdit={() => setIsEditing(true)}
          onCancel={() => setIsEditing(false)}
        />
      </Card>

      <Card className="p-6">
        <NotificationPreferences />
      </Card>

      <BusinessProfileManager />
    </div>
  );
};