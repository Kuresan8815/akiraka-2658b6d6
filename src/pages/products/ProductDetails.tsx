import React from 'react';
import { useParams } from 'react-router-dom';
import { ProductDetailsModal } from '@/components/ProductDetailsModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ProductDetails = () => {
  const { id } = useParams();
  
  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      return data;
    },
  });

  return (
    <div className="container mx-auto p-4">
      <ProductDetailsModal product={product} isOpen={true} onClose={() => {}} />
    </div>
  );
};

export default ProductDetails;