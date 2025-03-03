
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { Product } from "@/types/product";
import { verifyProductOnBlockchain } from "@/utils/blockchainUtils";

interface ProductBlockchainVerificationProps {
  product: Product;
  onVerificationComplete?: () => void;
}

export const ProductBlockchainVerification = ({ 
  product, 
  onVerificationComplete 
}: ProductBlockchainVerificationProps) => {
  const { toast } = useToast();

  // Create a mutation for product verification
  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!product.id) {
        throw new Error("Missing product data");
      }

      const verificationResult = await verifyProductOnBlockchain({
        productId: product.id,
        productData: {
          name: product.name,
          certification_level: product.certification_level,
          carbon_footprint: product.carbon_footprint,
          water_usage: product.water_usage,
          sustainability_score: product.sustainability_score,
          origin: product.origin
        }
      });

      if (verificationResult.status !== "success") {
        throw new Error(verificationResult.message);
      }

      // Update the local database with the blockchain verification data
      const { error: updateError } = await supabase
        .from("products")
        .update({
          blockchain_tx_id: verificationResult.transaction_hash,
          blockchain_verified_at: new Date().toISOString()
        })
        .eq("id", product.id);

      if (updateError) {
        throw updateError;
      }

      return verificationResult;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Product verified on blockchain",
      });
      
      if (onVerificationComplete) {
        onVerificationComplete();
      }
    },
    onError: (error: any) => {
      console.error('Failed to verify product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify product on blockchain",
        variant: "destructive",
      });
    }
  });

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
        onClick={() => verifyMutation.mutate()}
        disabled={verifyMutation.isPending}
        className="w-full"
      >
        {verifyMutation.isPending ? (
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
