import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductDetails } from "@/components/ProductDetails";
import { Product } from "@/types/product";

interface LatestScanProps {
  scan?: {
    products: Product;
    scanned_at: string;
  };
}

export const LatestScan = ({ scan }: LatestScanProps) => {
  if (!scan) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Scan</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductDetails product={scan.products} />
      </CardContent>
    </Card>
  );
};