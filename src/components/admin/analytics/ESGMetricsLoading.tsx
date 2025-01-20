import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ESGMetricsLoading = () => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-eco-primary mb-6">ESG Metrics</h2>
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-[200px]" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[200px]" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};