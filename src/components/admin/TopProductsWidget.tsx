import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TopProduct {
  id: string;
  name: string;
  scan_count: number;
}

export const TopProductsWidget = () => {
  const { data: topProducts, isLoading } = useQuery({
    queryKey: ["top-products"],
    queryFn: async () => {
      return [
        { id: "1", name: "Organic Cotton T-Shirt", scan_count: 320 },
        { id: "2", name: "Eco-Friendly Water Bottle", scan_count: 210 },
        { id: "3", name: "Bamboo Toothbrush", scan_count: 100 }
      ] as TopProduct[];
    },
  });

  const maxScanCount = topProducts?.[0]?.scan_count || 1;

  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle className="text-lg text-eco-primary">Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading top products...</p>
        ) : (
          <div className="space-y-4">
            {topProducts?.map((product) => (
              <div key={product.id} className="space-y-2">
                <div className="flex justify-between">
                  <p className="font-medium">{product.name}</p>
                  <span className="text-sm text-eco-primary">
                    {product.scan_count} scans
                  </span>
                </div>
                <Progress
                  value={(product.scan_count / maxScanCount) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};