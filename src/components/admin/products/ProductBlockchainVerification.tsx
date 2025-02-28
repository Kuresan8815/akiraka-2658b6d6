
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { Product } from "@/types/product";

interface ProductBlockchainVerificationProps {
  product: Product;
  onVerificationComplete?: () => void;
}

export const ProductBlockchainVerification = ({ 
  product, 
  onVerificationComplete 
}: ProductBlockchainVerificationProps) => {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyProduct = async () => {
    if (!product.id) {
      toast({
        title: "Error",
        description: "Missing product data",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const payload = {
        action: 'verifyProduct',
        productId: product.id,
        productData: {
          name: product.name,
          certification_level: product.certification_level,
          carbon_footprint: product.carbon_footprint,
          water_usage: product.water_usage,
          sustainability_score: product.sustainability_score,
          origin: product.origin
        }
      };

      console.log('Verifying product on blockchain:', payload);

      const { data, error } = await supabase.functions.invoke('verify-tezos-metric', {
        body: payload
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Verification response:', data);
      toast({
        title: "Success",
        description: "Product verified on blockchain",
      });
      
      if (onVerificationComplete) {
        onVerificationComplete();
      }
    } catch (error) {
      console.error('Failed to verify product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify product on blockchain",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (product.blockchain_tx_id) {
    return (
      <div className="border border-green-100 bg-green-50 rounded-md p-3 space-y-2">
        <div className="flex items-center">
          <Check className="h-4 w-4 text-green-600 mr-2" />
          <span className="text-sm font-medium text-green-700">Product Verified on Blockchain</span>
        </div>
        <p className="text-xs text-green-600">
          This product's authenticity has been verified on the Tezos blockchain.
        </p>
        <p className="text-xs text-gray-500 truncate">
          Transaction: {product.blockchain_tx_id}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-yellow-100 bg-yellow-50 rounded-md p-3 space-y-2">
      <div className="flex items-center">
        <ExternalLink className="h-4 w-4 text-yellow-600 mr-2" />
        <span className="text-sm font-medium text-yellow-700">Not Verified on Blockchain</span>
      </div>
      <p className="text-xs text-yellow-600">
        This product is not yet verified on the blockchain. Verify it to make it immutable and visible in analytics.
      </p>
      <Button 
        size="sm" 
        variant="default" 
        onClick={handleVerifyProduct}
        disabled={isVerifying}
        className="w-full"
      >
        {isVerifying ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <ExternalLink className="h-4 w-4 mr-2" />
            Verify on Blockchain
          </>
        )}
      </Button>
    </div>
  );
};
