import { supabase } from "@/integrations/supabase/client";
import { Profile as ProfileType, ProfilePreferences } from "@/types/profile";
import { Json } from "@/integrations/supabase/types";

export const fetchUserProfile = async (userId: string): Promise<ProfileType> => {
  const { data: profileData, error } = await supabase
    .from("profiles")
    .select("*, email:auth.users!inner(email)")
    .eq("id", userId)
    .single();

  if (error) throw error;

  const defaultPreferences: ProfilePreferences = {
    notifications: true,
    darkTheme: false
  };

  return {
    id: profileData.id,
    name: profileData.name,
    email: profileData.email?.email || '',
    avatar_url: profileData.avatar_url,
    sustainability_goals: profileData.sustainability_goals || [],
    preferences: profileData.preferences as ProfilePreferences || defaultPreferences,
    created_at: profileData.created_at,
    updated_at: profileData.updated_at,
    has_completed_onboarding: profileData.has_completed_onboarding
  };
};

export const updateUserPreferences = async (userId: string, preferences: ProfilePreferences) => {
  const preferencesJson = {
    notifications: preferences.notifications,
    darkTheme: preferences.darkTheme
  } as unknown as Json;

  const { error } = await supabase
    .from("profiles")
    .update({ preferences: preferencesJson })
    .eq("id", userId);

  if (error) throw error;
};

export const updateUserProfile = async (userId: string, name: string, sustainabilityGoals: string[]) => {
  const { error } = await supabase
    .from("profiles")
    .update({
      name,
      sustainability_goals: sustainabilityGoals,
    })
    .eq("id", userId);

  if (error) throw error;
};