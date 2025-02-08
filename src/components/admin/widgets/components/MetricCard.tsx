import { BusinessWidget } from "@/types/widgets";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Trash2, GripVertical, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface MetricCardProps {
  businessWidget: BusinessWidget;
  metricValue: string;
  onMetricChange: (value: string) => void;
  onUpdate: () => void;
  onRemove: () => void;
}

export const MetricCard = ({
  businessWidget,
  metricValue,
  onMetricChange,
  onUpdate,
  onRemove,
}: MetricCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onRemove();
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center mb-2">
          <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
          <h3 className="font-semibold">{businessWidget.widget.name}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">{businessWidget.widget.description}</p>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder={`Enter value (${businessWidget.widget.unit})`}
            value={metricValue}
            onChange={(e) => onMetricChange(e.target.value)}
            disabled
          />
          <Button
            size="icon"
            variant="outline"
            onClick={onUpdate}
            disabled
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="text-red-500 hover:text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {businessWidget.widget.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};