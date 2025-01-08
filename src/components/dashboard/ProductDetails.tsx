import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf } from "lucide-react";
import { Product } from "@/types/product";
import { CertificationBadge } from "./badges/CertificationBadge";
import { SustainabilityMetrics } from "./metrics/SustainabilityMetrics";

interface ProductDetailsProps {
  product: Product;
}

export const ProductDetails = ({ product }: ProductDetailsProps) => {
  if (!product) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-eco-primary">{product.name}</CardTitle>
        <div className="flex flex-col gap-2">
          <CertificationBadge certificationLevel={product.certification_level} />
          <Badge className="bg-green-500">
            <Leaf className="mr-1 h-3 w-3" />
            Sustainability Score: {product.sustainability_score}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <SustainabilityMetrics product={product} />
      </CardContent>
    </Card>
  );
};