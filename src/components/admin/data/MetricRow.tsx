import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2, Save, X } from "lucide-react";
import { MetricRow as MetricRowType } from "@/types/metrics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MetricRowProps {
  metric: MetricRowType;
  onEdit: (id: string) => void;
  onSave: (id: string, value: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onValueChange: (id: string, value: string) => void;
}

export const MetricRowComponent: React.FC<MetricRowProps> = ({
  metric,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onValueChange,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);

  const handleSave = () => {
    setShowSaveDialog(false);
    onSave(metric.id, String(metric.value));
  };

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete(metric.id);
  };

  return (
    <>
      <tr key={metric.id}>
        <td className="px-4 py-2">{metric.name}</td>
        <td className="px-4 py-2">{metric.unit}</td>
        <td className="px-4 py-2">
          {metric.isEditing ? (
            <Input
              type="text"
              value={metric.value}
              onChange={(e) => onValueChange(metric.id, e.target.value)}
              className="w-full"
            />
          ) : (
            metric.value
          )}
        </td>
        <td className="px-4 py-2">{metric.lastUpdated}</td>
        <td className="px-4 py-2">
          <div className="flex space-x-2">
            {metric.isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancel(metric.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(metric.id)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </td>
      </tr>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this metric value? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Save</DialogTitle>
            <DialogDescription>
              Are you sure you want to save these changes?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};