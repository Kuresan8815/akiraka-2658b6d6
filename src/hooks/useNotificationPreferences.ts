import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";
import { NotificationPreferences, Profile } from "@/types/notifications";

export const useNotificationPreferences = () => {
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
    mutationFn: async (preferences: Json) => {
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

  const parsedPreferences = profile?.preferences as NotificationPreferences || { notifications: {} };

  const updatePreference = (key: string, value: boolean) => {
    const newPreferences = {
      ...parsedPreferences,
      notifications: {
        ...parsedPreferences.notifications,
        [key]: value,
      },
    };
    updatePreferencesMutation.mutate(newPreferences as Json);
  };

  return {
    preferences: parsedPreferences,
    isLoading,
    updatePreference,
  };
};