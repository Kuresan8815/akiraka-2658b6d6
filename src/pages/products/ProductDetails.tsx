import React from 'react';
import { useParams } from 'react-router-dom';
import { ProductDetailsModal } from '@/components/ProductDetailsModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

export const ProductDetails = () => {
  const { id } = useParams();
  
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

  if (!product) return null;

  return (
    <div className="container mx-auto p-4">
      <ProductDetailsModal 
        product={product} 
        isOpen={true} 
        onClose={() => {}} 
      />
    </div>
  );
};

export default ProductDetails;