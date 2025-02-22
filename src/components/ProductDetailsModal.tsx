
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductBasicInfo } from "./product/ProductBasicInfo";
import { ProductSustainabilityMetrics } from "./product/ProductSustainabilityMetrics";
import { ProductVerificationInfo } from "./product/ProductVerificationInfo";
import { Product } from "@/types/product";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductDetailsModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

export const ProductDetailsModal = ({ 
  product, 
  isOpen, 
  onClose,
  isAdmin = false,
  onEditClick,
  onDeleteClick
}: ProductDetailsModalProps) => {
  if (!product) return null;

  const certificationColor = {
    Bronze: "bg-orange-500",
    Silver: "bg-gray-400",
    Gold: "bg-yellow-500",
  }[product.certification_level];

  const verificationUrl = `${window.location.origin}/verify/${product.id}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <ScrollArea className="h-full max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl text-eco-primary flex justify-between items-center">
                {product.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <ProductBasicInfo product={product} certificationColor={certificationColor} />
              <ProductSustainabilityMetrics product={product} />
              <ProductVerificationInfo 
                product={product} 
                verificationUrl={verificationUrl}
                isAdmin={isAdmin}
                onEdit={onEditClick}
                onDelete={onDeleteClick}
              />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
