import { Bell, Gift, Lightbulb, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface Notification {
  id: string;
  type: "rewards" | "sustainability_tips" | "store_alerts";
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsListProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (ids: string[]) => void;
}

export const NotificationsList = ({
  notifications,
  isLoading,
  onMarkAsRead,
}: NotificationsListProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "rewards":
        return <Gift className="h-5 w-5 text-yellow-500" />;
      case "sustainability_tips":
        return <Lightbulb className="h-5 w-5 text-green-500" />;
      case "store_alerts":
        return <Store className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="text-center py-8">
        <Bell className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
        <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex justify-between items-center p-2">
          <span className="text-sm text-gray-500">
            {selectedIds.length} selected
          </span>
          <Button
            variant="outline"
            onClick={() => {
              onMarkAsRead(selectedIds);
              setSelectedIds([]);
            }}
          >
            Mark as Read
          </Button>
        </div>
      )}
      
      <ScrollArea className="h-[500px] rounded-md border">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`p-4 mb-2 ${
              notification.is_read ? "bg-gray-50" : "bg-white"
            }`}
          >
            <div className="flex items-start gap-4">
              <Checkbox
                checked={selectedIds.includes(notification.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedIds([...selectedIds, notification.id]);
                  } else {
                    setSelectedIds(selectedIds.filter((id) => id !== notification.id));
                  }
                }}
              />
              <div className="flex-shrink-0">{getIcon(notification.type)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notification.is_read ? "text-gray-500" : "text-gray-900"}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </ScrollArea>
    </div>
  );
};