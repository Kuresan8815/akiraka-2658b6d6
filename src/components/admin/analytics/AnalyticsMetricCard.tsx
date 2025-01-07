import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsMetricCardProps {
  title: string;
  value: string;
  description: string;
}

export const AnalyticsMetricCard = ({
  title,
  value,
  description,
}: AnalyticsMetricCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-eco-primary">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};