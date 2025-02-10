
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetricRowActionsProps {
  isEditing: boolean;
  onSave: () => void;
  onEdit: () => void;
  onCancel: () => void;
}

export const MetricRowActions = ({
  isEditing,
  onSave,
  onEdit,
  onCancel,
}: MetricRowActionsProps) => {
  if (isEditing) {
    return (
      <div className="flex space-x-2">
        <Button size="sm" onClick={onSave}>
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" variant="outline" onClick={onEdit}>
      Update
    </Button>
  );
};
