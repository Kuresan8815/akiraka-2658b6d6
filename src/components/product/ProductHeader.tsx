import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Leaf } from "lucide-react";
import { Product } from "@/types/product";

interface ProductHeaderProps {
  product: Product;
  certificationColor: string;
}

export const ProductHeader = ({ product, certificationColor }: ProductHeaderProps) => (
  <CardHeader>
    <CardTitle className="text-xl text-eco-primary">
      {product.name}
    </CardTitle>
    <div className="flex flex-col gap-2">
      <Badge className={certificationColor}>
        <Award className="mr-1 h-3 w-3" />
        {product.certification_level} Certified
      </Badge>
      <Badge className="bg-green-500">
        <Leaf className="mr-1 h-3 w-3" />
        Sustainability Score: {product.sustainability_score}/100
      </Badge>
    </div>
  </CardHeader>
);