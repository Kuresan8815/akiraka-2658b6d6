import { DashboardWidgets } from "@/components/admin/dashboard/DashboardWidgets";

interface ESGMetricsSectionProps {
  businessId: string;
}

export const ESGMetricsSection = ({ businessId }: ESGMetricsSectionProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-eco-primary mb-6">ESG Metrics</h2>
      <DashboardWidgets businessId={businessId} />
    </div>
  );
};