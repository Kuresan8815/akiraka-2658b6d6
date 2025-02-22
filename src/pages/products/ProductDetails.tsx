
import React, { useState } from 'react';
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
  
  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Ensure certification_level is one of the allowed values
      if (data && !['Bronze', 'Silver', 'Gold'].includes(data.certification_level)) {
        data.certification_level = 'Bronze';
      }
      
      return data as Product;
    },
  });

  // Check if user is admin
  const { data: adminUser } = useQuery({
    queryKey: ['adminCheck'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .single();
      
      if (error) return null;
      return data;
    },
  });

  const handleEdit = () => {
    // Navigate to edit product page or show edit modal
    console.log('Edit product:', product?.id);
    // You can implement the edit functionality here
  };

  const handleDelete = async () => {
    if (!product?.id) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

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
        isAdmin={!!adminUser}
        onEditClick={handleEdit}
        onDeleteClick={handleDelete}
      />
    </div>
  );
};

export default ProductDetails;
