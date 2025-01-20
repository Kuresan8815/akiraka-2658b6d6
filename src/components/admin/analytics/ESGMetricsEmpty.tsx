import { Card } from "@/components/ui/card";

export const ESGMetricsEmpty = () => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-eco-primary mb-6">ESG Metrics</h2>
      <Card className="p-6 text-center">
        <p className="text-gray-500">No ESG metrics selected. Please add widgets from the Widgets page.</p>
      </Card>
    </div>
  );
};