import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductDetails } from "./ProductDetails";
import { ScanHistoryItem } from "@/types/scan";

interface LatestScanProps {
  scan?: ScanHistoryItem;
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