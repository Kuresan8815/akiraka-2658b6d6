import { supabase } from "@/integrations/supabase/client";
import { Profile as ProfileType, ProfilePreferences } from "@/types/profile";
import { Json } from "@/integrations/supabase/types";

interface ProfileData {
  id: string;
  name: string | null;
  email: { email: string };
  avatar_url?: string;
  sustainability_goals: string[] | null;
  preferences: ProfilePreferences | null;
  created_at: string;
  updated_at: string;
  has_completed_onboarding: boolean | null;
}

export const fetchUserProfile = async (userId: string): Promise<ProfileType> => {
  const { data: profileData, error } = await supabase
    .from("profiles")
    .select(`
      *,
      email:auth.users!inner(email)
    `)
    .eq("id", userId)
    .single();

  if (error) throw error;

  const data = profileData as unknown as ProfileData;
  const defaultPreferences: ProfilePreferences = {
    notifications: true,
    darkTheme: false
  };

  return {
    id: data.id,
    name: data.name,
    email: data.email?.email || '',
    avatar_url: data.avatar_url,
    sustainability_goals: data.sustainability_goals || [],
    preferences: data.preferences || defaultPreferences,
    created_at: data.created_at,
    updated_at: data.updated_at,
    has_completed_onboarding: data.has_completed_onboarding
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