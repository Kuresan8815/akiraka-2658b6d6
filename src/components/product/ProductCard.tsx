import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Droplets, Factory } from "lucide-react";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const certificationColor = {
    Bronze: "bg-orange-500",
    Silver: "bg-gray-400",
    Gold: "bg-yellow-500",
  }[product.certification_level];

  return (
    <Card 
      className={cn(
        "group hover:shadow-lg transition-all duration-300 cursor-pointer animate-fade-up",
        "transform hover:-translate-y-1"
      )}
      onClick={onClick}
    >
      {product.image_url && (
        <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg text-eco-primary line-clamp-2">
            {product.name}
          </h3>
          <Badge className={certificationColor}>
            {product.certification_level}
          </Badge>
        </div>
        <Badge className={cn("w-fit", getSustainabilityColor(product.sustainability_score))}>
          <Leaf className="w-4 h-4 mr-1" />
          Score: {product.sustainability_score}/100
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Leaf className="text-eco-primary w-4 h-4" />
            <div>
              <p className="font-medium">Carbon</p>
              <p className="text-gray-600">{product.carbon_footprint} kg CO₂</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="text-eco-primary w-4 h-4" />
            <div>
              <p className="font-medium">Water</p>
              <p className="text-gray-600">{product.water_usage} L</p>
            </div>
          </div>
        </div>
        {product.origin && (
          <div className="flex items-center gap-2 text-sm">
            <Factory className="text-eco-primary w-4 h-4" />
            <div>
              <p className="font-medium">Origin</p>
              <p className="text-gray-600">{product.origin}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};