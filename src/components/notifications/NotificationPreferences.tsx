import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { PreferenceCard } from "./PreferenceCard";
import { notificationTypes } from "@/config/notificationTypes";
import { NotificationPreferences as NotificationPreferencesType } from "@/types/notifications";

export const NotificationPreferences = () => {
  const { preferences, isLoading, updatePreference } = useNotificationPreferences();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notificationTypes.map((type) => (
        <PreferenceCard
          key={type.id}
          type={type}
          checked={preferences?.notifications?.[type.id as keyof NotificationPreferencesType["notifications"]] ?? true}
          onCheckedChange={(checked) => updatePreference(type.id, checked)}
        />
      ))}
    </div>
  );
};