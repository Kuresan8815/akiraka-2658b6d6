
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { ProductBlockchainVerification } from "./ProductBlockchainVerification";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const onSubmit = async (formData: any) => {
    try {
      setIsLoading(true);
      console.log("Starting product update with data:", formData);

      // Check authentication status
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated. Please log in.");
      }

      // Convert numeric strings to numbers
      const updateData = {
        name: formData.name,
        category: formData.category,
        material_composition: formData.material_composition,
        certification_level: formData.certification_level,
        carbon_footprint: Number(formData.carbon_footprint),
        water_usage: Number(formData.water_usage),
        origin: formData.origin,
        sustainability_score: Number(formData.sustainability_score),
        recyclability_percentage: Number(formData.recyclability_percentage)
      };

      console.log("Formatted update data:", updateData);

      // Store the previous state for audit log
      const previousState = { ...product };

      // Update the product first
      const { error: updateError, data: updatedProduct } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", product.id)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error("Update error details:", updateError);
        throw new Error(updateError.message);
      }

      if (!updatedProduct) {
        throw new Error("Product not found or no changes made");
      }

      console.log("Product updated successfully:", updatedProduct);

      // Create audit log entry
      const changes = {
        before: previousState,
        after: updatedProduct
      };

      console.log("Creating audit log with changes:", changes);

      const { error: auditError } = await supabase
        .from("product_audit_logs")
        .insert({
          product_id: product.id,
          action: "update",
          changes: changes
        });

      if (auditError) {
        console.warn("Audit log creation error:", auditError);
      } else {
        console.log("Audit log created successfully");
      }

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      onSuccess();
    } catch (error) {
      console.error("Full error details:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = () => {
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name", { required: true })} />
          {errors.name && <span className="text-red-500 text-sm">This field is required</span>}
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
          <Select 
            defaultValue={product.certification_level}
            onValueChange={(value) => {
              register("certification_level").onChange({ target: { value } });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select certification level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bronze">Bronze</SelectItem>
              <SelectItem value="Silver">Silver</SelectItem>
              <SelectItem value="Gold">Gold</SelectItem>
            </SelectContent>
          </Select>
          {errors.certification_level && <span className="text-red-500 text-sm">This field is required</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="carbon_footprint">Carbon Footprint (kg CO₂)</Label>
          <Input
            id="carbon_footprint"
            type="number"
            step="0.01"
            {...register("carbon_footprint", { required: true, min: 0 })}
          />
          {errors.carbon_footprint && <span className="text-red-500 text-sm">This field is required and must be positive</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="water_usage">Water Usage (liters)</Label>
          <Input
            id="water_usage"
            type="number"
            {...register("water_usage", { required: true, min: 0 })}
          />
          {errors.water_usage && <span className="text-red-500 text-sm">This field is required and must be positive</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="origin">Origin</Label>
          <Input id="origin" {...register("origin", { required: true })} />
          {errors.origin && <span className="text-red-500 text-sm">This field is required</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sustainability_score">Sustainability Score</Label>
          <Input
            id="sustainability_score"
            type="number"
            {...register("sustainability_score", { required: true, min: 0, max: 100 })}
          />
          {errors.sustainability_score && <span className="text-red-500 text-sm">Score must be between 0 and 100</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="recyclability_percentage">Recyclability (%)</Label>
          <Input
            id="recyclability_percentage"
            type="number"
            {...register("recyclability_percentage", { min: 0, max: 100 })}
          />
          {errors.recyclability_percentage && <span className="text-red-500 text-sm">Percentage must be between 0 and 100</span>}
        </div>
      </div>

      <div className="col-span-2">
        <ProductBlockchainVerification 
          product={product} 
          onVerificationComplete={handleVerificationComplete} 
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Product"}
        </Button>
      </div>
    </form>
  );
};
