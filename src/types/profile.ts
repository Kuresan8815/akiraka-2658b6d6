
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

export interface MerchantInteraction {
  business_id: string;
  business_name: string;
  total_scans: number;
  total_purchases: number;
  last_interaction: string;
}
