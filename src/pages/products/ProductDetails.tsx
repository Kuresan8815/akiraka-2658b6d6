
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductDetailsModal } from '@/components/ProductDetailsModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  
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

  const handleClose = () => {
    setIsOpen(false);
    // Navigate back to previous page or home
    navigate(-1);
  };

  if (!product) return null;

  return (
    <div className="container mx-auto p-4">
      <ProductDetailsModal 
        product={product} 
        isOpen={isOpen} 
        onClose={handleClose} 
      />
    </div>
  );
};

export default ProductDetails;
