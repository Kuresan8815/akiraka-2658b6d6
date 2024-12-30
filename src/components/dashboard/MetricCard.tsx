import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  iconPosition?: 'left' | 'right';
}

export const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  iconPosition = 'left' 
}: MetricCardProps) => (
  <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-[4px_4px_10px_rgba(0,0,0,0.1),-2px_-2px_10px_rgba(255,255,255,0.8)] border border-gray-100">
    <div className="p-4 flex items-center justify-between">
      {iconPosition === 'left' ? (
        <>
          <div className="flex items-center gap-4">
            <div className="bg-eco-primary/5 p-2 rounded-lg">
              <Icon className="h-8 w-8 text-eco-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-eco-primary mb-2">{title}</CardTitle>
              <div className="text-2xl font-bold text-eco-primary">{value}</div>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <CardTitle className="text-sm font-medium text-eco-primary mb-2">{title}</CardTitle>
            <div className="text-2xl font-bold text-eco-primary">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="bg-eco-primary/5 p-2 rounded-lg">
            <Icon className="h-8 w-8 text-eco-primary" />
          </div>
        </>
      )}
    </div>
  </Card>
);