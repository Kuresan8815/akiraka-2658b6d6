import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ProfilePreferences } from "@/types/profile";
import { Json } from "@/integrations/supabase/types";

const Notifications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: ProfilePreferences): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Convert ProfilePreferences to a plain object that matches Json type
      const preferencesJson: { [key: string]: boolean } = {
        notifications: preferences.notifications,
        darkTheme: preferences.darkTheme
      };

      const { error } = await supabase
        .from("profiles")
        .update({ preferences: preferencesJson as Json })
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Success",
        description: "Preferences updated successfully",
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

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const { data, error } = await supabase.rpc(
        "mark_notifications_as_read",
        { notification_ids: notificationIds }
      );
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Success",
        description: "Notifications marked as read",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
      console.error("Error marking notifications as read:", error);
    },
  });

  // Default preferences if none exist
  const defaultPreferences: ProfilePreferences = {
    notifications: true,
    darkTheme: false
  };

  // Safely convert the stored Json preferences to ProfilePreferences type
  const storedPreferences = profile?.preferences as { [key: string]: boolean } | null;
  const currentPreferences: ProfilePreferences = storedPreferences
    ? {
        notifications: Boolean(storedPreferences.notifications),
        darkTheme: Boolean(storedPreferences.darkTheme)
      }
    : defaultPreferences;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <NotificationsList 
            notifications={notifications || []}
            isLoading={isLoading}
            onMarkAsRead={(ids) => markAsReadMutation.mutate(ids)}
          />
        </TabsContent>
        
        <TabsContent value="preferences">
          <NotificationPreferences 
            preferences={currentPreferences}
            onUpdate={async (prefs) => {
              await updatePreferencesMutation.mutateAsync(prefs);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;