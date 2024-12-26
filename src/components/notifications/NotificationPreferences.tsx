import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Gift, Lightbulb, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferences {
  notifications?: {
    rewards?: boolean;
    sustainability_tips?: boolean;
    store_alerts?: boolean;
  };
}

interface Profile {
  preferences: NotificationPreferences | null;
}

export const NotificationPreferences = () => {
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const { data, error } = await supabase
        .from("profiles")
        .select("preferences")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: NotificationPreferences) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const { error } = await supabase
        .from("profiles")
        .update({ preferences })
        .eq("id", session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Notification preferences updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    },
  });

  const preferences = profile?.preferences || { notifications: {} };

  const updatePreference = (key: string, value: boolean) => {
    const newPreferences = {
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: value,
      },
    };
    updatePreferencesMutation.mutate(newPreferences);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const notificationTypes = [
    {
      id: "rewards",
      label: "Rewards Notifications",
      description: "Get notified about new rewards and points",
      icon: Gift,
    },
    {
      id: "sustainability_tips",
      label: "Sustainability Tips",
      description: "Receive helpful tips for sustainable living",
      icon: Lightbulb,
    },
    {
      id: "store_alerts",
      label: "Store Alerts",
      description: "Updates about store events and promotions",
      icon: Store,
    },
  ];

  return (
    <div className="space-y-4">
      {notificationTypes.map(({ id, label, description, icon: Icon }) => (
        <Card key={id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Icon className="h-5 w-5 text-gray-500" />
              <div>
                <h3 className="text-sm font-medium">{label}</h3>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            </div>
            <Switch
              checked={preferences?.notifications?.[id as keyof typeof preferences.notifications] ?? true}
              onCheckedChange={(checked) => updatePreference(id, checked)}
            />
          </div>
        </Card>
      ))}
    </div>
  );
};