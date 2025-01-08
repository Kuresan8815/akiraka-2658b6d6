import { ProductDetails } from "@/components/ProductDetails";

interface LatestScanProps {
  scan?: any;
}

export const LatestScan = ({ scan }: LatestScanProps) => {
  if (!scan) return null;
  
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-eco-primary mb-4">Latest Scan</h3>
      <ProductDetails product={scan.products} />
    </div>
  );
};