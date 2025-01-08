import { Leaf, Droplets } from "lucide-react";
import { Product } from "@/types/product";

interface SustainabilityMetricsProps {
  product: Product;
}

export const SustainabilityMetrics = ({ product }: SustainabilityMetricsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="flex items-center gap-2">
      <Leaf className="text-eco-primary h-5 w-5" />
      <div>
        <p className="text-sm font-medium">Carbon Footprint</p>
        <p className="text-sm text-gray-600">{product.carbon_footprint} kg CO₂</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Droplets className="text-eco-primary h-5 w-5" />
      <div>
        <p className="text-sm font-medium">Water Usage</p>
        <p className="text-sm text-gray-600">{product.water_usage} liters</p>
      </div>
    </div>
  </div>
);