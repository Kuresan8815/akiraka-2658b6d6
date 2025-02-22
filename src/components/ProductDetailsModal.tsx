
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ProductBasicInfo } from "./product/ProductBasicInfo";
import { ProductSustainabilityMetrics } from "./product/ProductSustainabilityMetrics";
import { ProductVerificationInfo } from "./product/ProductVerificationInfo";
import { Product } from "@/types/product";
import { Share2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  
  if (!product) return null;

  const certificationColor = {
    Bronze: "bg-orange-500",
    Silver: "bg-gray-400",
    Gold: "bg-yellow-500",
  }[product.certification_level];

  const verificationUrl = `${window.location.origin}/verify/${product.id}`;

  const handleShare = async () => {
    const shareData = {
      title: `Check out this product: ${product.name}`,
      text: `View sustainability details for ${product.name}`,
      url: verificationUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(verificationUrl);
        toast({
          title: "Link copied!",
          description: "Product link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Sharing failed",
        description: "Could not share the product link",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl text-eco-primary">
            {product.name}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-gray-500 hover:text-gray-700"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
