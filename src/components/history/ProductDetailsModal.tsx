import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Leaf, Droplets, AlertCircle } from "lucide-react";

interface ProductDetailsModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailsModal = ({ product, isOpen, onClose }: ProductDetailsModalProps) => {
  if (!product) return null;

  const certificationColor = {
    Bronze: "bg-orange-500",
    Silver: "bg-gray-400",
    Gold: "bg-yellow-500",
  }[product.certification_level];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl text-eco-primary flex justify-between items-center">
            {product.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Badge className={certificationColor}>
              {product.certification_level} Certified
            </Badge>
            <Badge className="bg-green-500">
              Sustainability Score: {product.sustainability_score}/100
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="text-eco-primary" />
              <div>
                <p className="text-sm font-medium">Carbon Footprint</p>
                <p className="text-sm text-gray-600">
                  {product.carbon_footprint} kg CO₂
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Droplets className="text-eco-primary" />
              <div>
                <p className="text-sm font-medium">Water Usage</p>
                <p className="text-sm text-gray-600">
                  {product.water_usage} liters
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AlertCircle className="text-eco-primary" />
              <div>
                <p className="text-sm font-medium">Origin</p>
                <p className="text-sm text-gray-600">{product.origin}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};