import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
}

export const MetricCard = ({ title, value, icon: Icon, description }: MetricCardProps) => (
  <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-[4px_4px_10px_rgba(0,0,0,0.1),-2px_-2px_10px_rgba(255,255,255,0.8)] border border-gray-100">
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <CardTitle className="text-sm font-medium text-eco-primary">{title}</CardTitle>
          <Icon className="h-6 w-6 text-eco-primary mt-2" />
        </div>
        <div className="text-2xl font-bold text-eco-primary">{value}</div>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  </Card>
);