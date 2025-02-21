
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

interface EditProductFormProps {
  product: Product;
  onSuccess: () => void;
}

export const EditProductForm = ({ product, onSuccess }: EditProductFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: product.name,
      category: product.category || "",
      material_composition: product.material_composition || "",
      certification_level: product.certification_level,
      carbon_footprint: product.carbon_footprint,
      water_usage: product.water_usage,
      origin: product.origin,
      sustainability_score: product.sustainability_score,
      recyclability_percentage: product.recyclability_percentage || 0,
    },
  });

  const createBlockchainTransaction = async (changes: any) => {
    try {
      // Simulate blockchain transaction - in a real app, this would interact with a blockchain
      const txHash = `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      return txHash;
    } catch (error) {
      console.error("Error creating blockchain transaction:", error);
      throw error;
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);

      // Get the old product data for comparison
      const oldData = { ...product };
      
      // Create blockchain transaction
      const blockchainTxId = await createBlockchainTransaction({
        type: "update",
        productId: product.id,
        changes: {
          before: oldData,
          after: data
        }
      });
      
      // Update the product with blockchain reference
      const { error: updateError } = await supabase
        .from("products")
        .update({
          ...data,
          blockchain_tx_id: blockchainTxId,
          blockchain_hash: blockchainTxId // In a real app, this would be a proper hash
        })
        .eq("id", product.id);

      if (updateError) throw updateError;

      // Create audit log entry
      const { error: auditError } = await supabase
        .from("product_audit_logs")
        .insert({
          product_id: product.id,
          action: "update",
          changes: {
            before: oldData,
            after: data,
          },
          blockchain_tx_id: blockchainTxId
        });

      if (auditError) throw auditError;

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      onSuccess();
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name", { required: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" {...register("category")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="material_composition">Material Composition</Label>
          <Input id="material_composition" {...register("material_composition")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="certification_level">Certification Level</Label>
          <Input id="certification_level" {...register("certification_level", { required: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="carbon_footprint">Carbon Footprint (kg CO₂)</Label>
          <Input
            id="carbon_footprint"
            type="number"
            step="0.01"
            {...register("carbon_footprint", { required: true, min: 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="water_usage">Water Usage (liters)</Label>
          <Input
            id="water_usage"
            type="number"
            {...register("water_usage", { required: true, min: 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="origin">Origin</Label>
          <Input id="origin" {...register("origin", { required: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sustainability_score">Sustainability Score</Label>
          <Input
            id="sustainability_score"
            type="number"
            {...register("sustainability_score", { required: true, min: 0, max: 100 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recyclability_percentage">Recyclability (%)</Label>
          <Input
            id="recyclability_percentage"
            type="number"
            {...register("recyclability_percentage", { min: 0, max: 100 })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Product"}
        </Button>
      </div>
    </form>
  );
};
