import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ProductVerificationInfoProps {
  product: Product;
  verificationUrl: string;
}

export const ProductVerificationInfo = ({ product, verificationUrl }: ProductVerificationInfoProps) => {
  const { toast } = useToast();
  const blockchainUrl = product.blockchain_tx_id 
    ? `https://example-blockchain-explorer.com/tx/${product.blockchain_tx_id}`
    : verificationUrl;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(verificationUrl);
    toast({
      title: "Copied!",
      description: "Verification URL copied to clipboard",
    });
  };

  return (
    <Card className="col-span-2">
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-center">
          <QRCodeSVG
            value={blockchainUrl}
            size={200}
            level="H"
            includeMargin
          />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Scan to verify product authenticity</p>
          <p className="text-sm text-muted-foreground">
            This QR code links to the blockchain record of this product
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
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.open(blockchainUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Record
          </Button>
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