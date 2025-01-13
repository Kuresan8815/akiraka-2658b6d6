import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/product";

interface ProductBasicInfoProps {
  product: Product;
  certificationColor: string;
}

export const ProductBasicInfo = ({ product, certificationColor }: ProductBasicInfoProps) => {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
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
            <FileText className="text-eco-primary" />
            <div>
              <p className="text-sm font-medium">Category</p>
              <p className="text-sm text-gray-600">
                {product.category || 'Not specified'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="text-eco-primary" />
            <div>
              <p className="text-sm font-medium">Material Composition</p>
              <p className="text-sm text-gray-600">
                {product.material_composition || 'Not specified'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="text-eco-primary" />
            <div>
              <p className="text-sm font-medium">Recyclability</p>
              <p className="text-sm text-gray-600">
                {product.recyclability_percentage ? `${product.recyclability_percentage}%` : 'Not specified'}
              </p>
            </div>
          </div>

          {product.manufacture_date && (
            <div className="flex items-center gap-2">
              <FileText className="text-eco-primary" />
              <div>
                <p className="text-sm font-medium">Manufacture Date</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(product.manufacture_date), 'PPP')}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};