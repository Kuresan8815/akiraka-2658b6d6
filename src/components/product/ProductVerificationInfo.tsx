
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ProductAuditLog } from "@/components/admin/products/ProductAuditLog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EditProductForm } from "@/components/admin/products/EditProductForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductVerificationInfoProps {
  product: Product;
  verificationUrl: string;
  isAdmin?: boolean;
}

export const ProductVerificationInfo = ({ 
  product, 
  verificationUrl,
  isAdmin = false 
}: ProductVerificationInfoProps) => {
  const { toast } = useToast();
  const [isRecordsOpen, setIsRecordsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: isAuthenticated } = useQuery({
    queryKey: ['auth-status'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    }
  });

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(verificationUrl);
    toast({
      title: "Copied!",
      description: "Verification URL copied to clipboard",
    });
  };

  const handleEditSuccess = () => {
    setIsEditOpen(false);
    toast({
      title: "Success",
      description: "Product updated successfully",
    });
  };

  return (
    <Card className="col-span-2">
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-center">
          <QRCodeSVG
            value={verificationUrl}
            size={200}
            level="H"
            includeMargin
          />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Scan to verify product authenticity</p>
          <p className="text-sm text-muted-foreground">
            This QR code links to the verification record of this product
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleCopyUrl}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy URL
          </Button>

          {/* View Records Sheet */}
          <Sheet open={isRecordsOpen} onOpenChange={setIsRecordsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Record
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[90%] sm:w-[600px]">
              <SheetHeader>
                <SheetTitle>Product History</SheetTitle>
                <SheetDescription>
                  Complete history of changes made to this product
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <ProductAuditLog productId={product.id} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Edit Product Sheet - Only visible to admins */}
          {isAdmin && (
            <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                >
                  Edit Product
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[90%] sm:w-[600px]">
                <SheetHeader>
                  <SheetTitle>Edit Product</SheetTitle>
                  <SheetDescription>
                    Make changes to product information
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <EditProductForm 
                    product={product}
                    onSuccess={handleEditSuccess}
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        {product.blockchain_tx_id && (
          <div className="text-xs text-muted-foreground break-all">
            <p>Transaction ID:</p>
            <p>{product.blockchain_tx_id}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
