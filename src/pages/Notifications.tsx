import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

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
          <NotificationPreferences />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;