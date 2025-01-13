import { Leaf, Droplets, AlertCircle, Barcode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/product";

interface ProductSustainabilityMetricsProps {
  product: Product;
}

export const ProductSustainabilityMetrics = ({ product }: ProductSustainabilityMetricsProps) => {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
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

        <div className="flex items-center gap-2">
          <Barcode className="text-eco-primary" />
          <div>
            <p className="text-sm font-medium">QR Code ID</p>
            <p className="text-sm text-gray-600">{product.qr_code_id}</p>
          </div>
        </div>

        {product.image_url && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Product Image</p>
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};