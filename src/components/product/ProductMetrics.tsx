import { CardContent } from "@/components/ui/card";
import { Factory, Leaf, Droplets } from "lucide-react";
import { Product } from "@/types/product";

interface ProductMetricsProps {
  product: Product;
}

export const ProductMetrics = ({ product }: ProductMetricsProps) => (
  <CardContent className="space-y-4">
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
      <Factory className="text-eco-primary" />
      <div>
        <p className="text-sm font-medium">Origin</p>
        <p className="text-sm text-gray-600">{product.origin}</p>
      </div>
    </div>
  </CardContent>
);