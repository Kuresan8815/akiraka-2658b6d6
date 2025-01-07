import React from 'react';
import { QRScanner } from '@/components/QRScanner';

export const Scan = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Scan Product</h1>
      <QRScanner />
    </div>
  );
};

export default Scan;