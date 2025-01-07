export interface ProfilePreferences {
  notifications: boolean;
  darkTheme: boolean;
}

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  sustainability_goals: string | null;
  preferences: ProfilePreferences;
}

export interface ProfileFormData {
  name: string;
  sustainabilityGoals: string;
  notifications: boolean;
  darkTheme: boolean;
}