import React from 'react';
import { useParams } from 'react-router-dom';
import { ProductDetailsModal } from '@/components/ProductDetailsModal';

export const ProductDetails = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-4">
      <ProductDetailsModal productId={id} />
    </div>
  );
};

export default ProductDetails;