import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface AdminMetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  onClick?: () => void;
}

export const AdminMetricCard = ({
  title,
  value,
  icon: Icon,
  description,
  onClick,
}: AdminMetricCardProps) => {
  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-lg" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-eco-primary mt-2">{value}</p>
          </div>
          <Icon className="h-6 w-6 text-eco-primary" />
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};