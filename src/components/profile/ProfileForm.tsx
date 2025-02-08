import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Profile, ProfileFormData } from "@/types/profile";

interface ProfileFormProps {
  profile: Profile;
  isEditing: boolean;
  onSubmit: (data: ProfileFormData) => void;
  onEdit: () => void;
  onCancel: () => void;
}

export const ProfileForm = ({ profile, isEditing, onSubmit, onEdit, onCancel }: ProfileFormProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const sustainabilityGoals = formData.get("sustainabilityGoals") as string;
    
    onSubmit({
      name: formData.get("name") as string || "",
      sustainabilityGoals: sustainabilityGoals ? sustainabilityGoals.split(',').map(goal => goal.trim()) : [],
      notifications: formData.get("notifications") === "on",
      darkTheme: formData.get("darkTheme") === "on",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <Input
          id="name"
          name="name"
          defaultValue={profile.name || ""}
          disabled={!isEditing}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          value={profile.email}
          disabled
          className="bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="sustainabilityGoals" className="text-sm font-medium">
          Sustainability Goals
        </label>
        <Textarea
          id="sustainabilityGoals"
          name="sustainabilityGoals"
          defaultValue={profile.sustainability_goals?.join(', ') || ""}
          disabled={!isEditing}
          className="min-h-[100px]"
          placeholder="Enter your goals separated by commas"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="notifications" className="text-sm">
              Enable Notifications
            </label>
            <Switch
              id="notifications"
              name="notifications"
              defaultChecked={profile.preferences?.notifications}
              disabled={!isEditing}
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="darkTheme" className="text-sm">
              Dark Theme
            </label>
            <Switch
              id="darkTheme"
              name="darkTheme"
              defaultChecked={profile.preferences?.darkTheme}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        {isEditing ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </>
        ) : (
          <Button
            type="button"
            onClick={onEdit}
          >
            Edit Profile
          </Button>
        )}
      </div>
    </form>
  );
};