import { Json } from "@/integrations/supabase/types";

export interface NotificationPreferences {
  notifications?: {
    rewards?: boolean;
    sustainability_tips?: boolean;
    store_alerts?: boolean;
  };
}

export interface Profile {
  preferences: Json | null;
}

export interface NotificationType {
  id: keyof NotificationPreferences["notifications"];
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}