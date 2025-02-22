
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductDetailsModal } from '@/components/ProductDetailsModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { useToast } from '@/components/ui/use-toast';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch product details
  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          businesses (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data && !['Bronze', 'Silver', 'Gold'].includes(data.certification_level)) {
        data.certification_level = 'Bronze';
      }
      
      return data as Product;
    },
  });

  // Check if user has admin access to this product's business
  const { data: businessAccess } = useQuery({
    queryKey: ['business-access', product?.business_id],
    enabled: !!product?.business_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('business_id', product?.business_id)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      
      if (error) return null;
      return data;
    },
  });

  const handleEdit = async () => {
    if (!businessAccess) return;
    // Navigate to edit product page or show edit modal
    console.log('Edit product:', product?.id);
  };

  const handleDelete = async () => {
    if (!businessAccess || !product?.id) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)
        .eq('business_id', product.business_id); // Extra safety check

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      navigate('/admin/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  if (!product) return null;

  return (
    <div className="container mx-auto p-4">
      <ProductDetailsModal 
        product={product} 
        isOpen={true} 
        onClose={() => navigate(-1)}
        isAdmin={!!businessAccess}
        onEditClick={handleEdit}
        onDeleteClick={handleDelete}
      />
    </div>
  );
};

export default ProductDetails;
