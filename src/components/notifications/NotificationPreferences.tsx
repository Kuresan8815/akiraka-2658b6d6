import { ProfilePreferences } from "@/types/profile";

interface NotificationPreferencesProps {
  preferences: ProfilePreferences;
  onUpdate: (preferences: ProfilePreferences) => Promise<void>;
}

export const NotificationPreferences = ({ preferences, onUpdate }: NotificationPreferencesProps) => {
  const handleToggle = async (key: keyof ProfilePreferences) => {
    const updatedPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    await onUpdate(updatedPreferences);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold">Notification Preferences</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm">Enable Notifications</label>
          <input
            type="checkbox"
            checked={preferences.notifications}
            onChange={() => handleToggle("notifications")}
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm">Dark Theme</label>
          <input
            type="checkbox"
            checked={preferences.darkTheme}
            onChange={() => handleToggle("darkTheme")}
          />
        </div>
      </div>
    </div>
  );
};
