import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { NotificationType } from "@/types/notifications";

interface PreferenceCardProps {
  type: NotificationType;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const PreferenceCard = ({ type, checked, onCheckedChange }: PreferenceCardProps) => {
  const Icon = type.icon;
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Icon className="h-5 w-5 text-gray-500" />
          <div>
            <h3 className="text-sm font-medium">{type.label}</h3>
            <p className="text-sm text-gray-500">{type.description}</p>
          </div>
        </div>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
      </div>
    </Card>
  );
};