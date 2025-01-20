import { Card } from "@/components/ui/card";

interface ESGMetricsErrorProps {
  error: Error;
}

export const ESGMetricsError = ({ error }: ESGMetricsErrorProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-eco-primary mb-6">ESG Metrics</h2>
      <Card className="p-6 text-center text-red-500">
        <p>Error loading ESG metrics: {error.message}</p>
      </Card>
    </div>
  );
};