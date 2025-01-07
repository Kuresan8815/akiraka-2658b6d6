import { Json } from "@/integrations/supabase/types";

export interface DatabaseUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProfile {
  id: string;
  name: string | null;
  email: string;
  sustainability_goals: string | null;
  preferences: {
    notifications: boolean;
    darkTheme: boolean;
  };
  created_at: string;
  updated_at: string;
  has_completed_onboarding: boolean | null;
}

export interface DatabaseReward {
  id: string;
  user_id: string;
  points_earned: number;
  points_redeemed: number;
  reward_history: Json;
  created_at: string;
  updated_at: string;
}