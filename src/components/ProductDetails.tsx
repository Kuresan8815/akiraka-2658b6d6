import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { useToast } from "./ui/use-toast";
import { Product } from "@/types/product";
import { ProductHeader } from "./product/ProductHeader";
import { ProductMetrics } from "./product/ProductMetrics";

const DEMO_PRODUCT: Product = {
  id: "demo",
  name: "Eco-Friendly Water Bottle",
  certification_level: "Gold",
  carbon_footprint: 0.5,
  water_usage: 2,
  origin: "Sustainable Factory, Sweden",
  qr_code_id: "demo",
  sustainability_score: 85,
};

interface ProductDetailsProps {
  product?: Product;
}

export const ProductDetails = ({ product: providedProduct }: ProductDetailsProps) => {
  const { qrCodeId } = useParams();
  const { toast } = useToast();

  const { data: fetchedProduct, isLoading } = useQuery({
    queryKey: ["product", qrCodeId],
    queryFn: async () => {
      if (providedProduct) return providedProduct;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("qr_code_id", qrCodeId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching product:", error);
        throw error;
      }

      if (!data) {
        toast({
          title: "Demo Mode",
          description: "Showing demo product details",
        });
        return DEMO_PRODUCT;
      }

      // Record scan in history if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from("scan_history").insert({
          user_id: user.id,
          product_id: data.id,
        });
      }

      return data as Product;
    },
  });

  const displayProduct = providedProduct || fetchedProduct;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  if (!displayProduct) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Product not found</p>
      </div>
    );
  }

  const certificationColor = {
    Bronze: "bg-orange-500",
    Silver: "bg-gray-400",
    Gold: "bg-yellow-500",
  }[displayProduct.certification_level];

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <Card>
        <ProductHeader 
          product={displayProduct} 
          certificationColor={certificationColor} 
        />
        <ProductMetrics product={displayProduct} />
      </Card>
    </div>
  );
};