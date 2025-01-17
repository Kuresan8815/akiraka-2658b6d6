import { Json } from "@/integrations/supabase/types";

export interface ProfilePreferences {
  notifications: boolean;
  darkTheme: boolean;
}

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  avatar_url?: string;
  sustainability_goals: string[] | null;
  preferences: ProfilePreferences;
  created_at: string;
  updated_at: string;
  has_completed_onboarding: boolean | null;
}

export interface ProfileFormData {
  name: string;
  sustainabilityGoals: string[];
  notifications: boolean;
  darkTheme: boolean;
  has_completed_onboarding: boolean;
}