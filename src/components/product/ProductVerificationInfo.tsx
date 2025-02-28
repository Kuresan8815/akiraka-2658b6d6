
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { Copy, ExternalLink, Edit, Trash, Check, FileText } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProductVerificationInfoProps {
  product: Product;
  verificationUrl: string;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ProductVerificationInfo = ({ 
  product, 
  verificationUrl,
  isAdmin = false,
  onEdit,
  onDelete
}: ProductVerificationInfoProps) => {
  const { toast } = useToast();
  const [isRecordsOpen, setIsRecordsOpen] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(verificationUrl);
    toast({
      title: "Copied!",
      description: "Verification URL copied to clipboard",
    });
  };

  const handleViewOnBlockchain = () => {
    if (product.blockchain_tx_id) {
      // Tezos block explorer URL for the transaction
      const blockExplorerUrl = `https://tzkt.io/${product.blockchain_tx_id}`;
      window.open(blockExplorerUrl, '_blank');
    }
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

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleCopyUrl}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy URL
          </Button>

          <Sheet open={isRecordsOpen} onOpenChange={setIsRecordsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Update History
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Update History</SheetTitle>
                <SheetDescription>
                  Changes made to {product.name}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <ProductAuditLog productId={product.id} />
              </div>
            </SheetContent>
          </Sheet>

          {isAdmin && (
            <>
              {onEdit && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={onEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={onDelete}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </>
          )}
        </div>

        {product.blockchain_tx_id ? (
          <div className="border border-green-100 bg-green-50 rounded-md p-3 text-sm space-y-2">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-600 mr-2" />
              <span className="font-medium text-green-700">Blockchain Verified</span>
            </div>
            <div className="text-xs text-gray-600 break-all">
              <p className="font-medium mb-1">Transaction ID:</p>
              <div className="flex items-center space-x-2">
                <span className="truncate">{product.blockchain_tx_id}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleViewOnBlockchain}>
                        <FileText className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View on Blockchain Explorer</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-yellow-100 bg-yellow-50 rounded-md p-3 text-sm space-y-2">
            <div className="flex items-center">
              <ExternalLink className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="font-medium text-yellow-700">Awaiting Verification</span>
            </div>
            <p className="text-xs text-yellow-600">
              This product is not yet verified on the blockchain.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
