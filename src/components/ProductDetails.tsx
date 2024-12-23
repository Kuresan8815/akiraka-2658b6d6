import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Award, Droplets, Factory, Leaf } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "./ui/use-toast";

const DEMO_PRODUCT = {
  id: "demo",
  name: "Eco-Friendly Water Bottle",
  certification_level: "Gold",
  carbon_footprint: 0.5,
  water_usage: 2,
  origin: "Sustainable Factory, Sweden",
  qr_code_id: "demo",
  sustainability_score: 85,
};

export const ProductDetails = () => {
  const { qrCodeId } = useParams();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", qrCodeId],
    queryFn: async () => {
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

      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  if (!product) {
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
  }[product.certification_level];

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <Card>
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
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Leaf className="text-eco-primary" />
            <div>
              <p className="text-sm font-medium">Carbon Footprint</p>
              <p className="text-sm text-gray-600">
                {product.carbon_footprint} kg CO₂
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Droplets className="text-eco-primary" />
            <div>
              <p className="text-sm font-medium">Water Usage</p>
              <p className="text-sm text-gray-600">
                {product.water_usage} liters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Factory className="text-eco-primary" />
            <div>
              <p className="text-sm font-medium">Origin</p>
              <p className="text-sm text-gray-600">{product.origin}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};