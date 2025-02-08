import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Widget } from "@/types/widgets";
import { Info, BarChart3, Calendar } from "lucide-react";

interface MetricDetailsModalProps {
  widget: Widget;
  value?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const MetricDetailsModal = ({
  widget,
  value,
  isOpen,
  onClose,
}: MetricDetailsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-eco-primary">
            {widget.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-eco-primary mt-0.5" />
            <div>
              <p className="font-medium">Description</p>
              <p className="text-sm text-gray-600">{widget.description}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <BarChart3 className="h-5 w-5 text-eco-primary mt-0.5" />
            <div>
              <p className="font-medium">Current Value</p>
              <p className="text-2xl font-bold text-eco-primary">
                {value?.toLocaleString() || '0'} {widget.unit}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-eco-primary mt-0.5" />
            <div>
              <p className="font-medium">Metric Details</p>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span> {widget.metric_type}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Category:</span> {widget.category}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};