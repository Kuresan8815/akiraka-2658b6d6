import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsGrid } from "../StatsGrid";

interface SustainabilityImpactWidgetProps {
  totalCarbonSaved: number;
  totalWaterSaved: number;
}

export const SustainabilityImpactWidget = ({ 
  totalCarbonSaved, 
  totalWaterSaved 
}: SustainabilityImpactWidgetProps) => (
  <Card className="h-full bg-gradient-to-br from-green-50 to-white">
    <CardHeader>
      <CardTitle className="text-xl font-bold text-eco-primary">
        My Sustainability Impact
      </CardTitle>
    </CardHeader>
    <CardContent>
      <StatsGrid 
        totalCarbonSaved={totalCarbonSaved} 
        totalWaterSaved={totalWaterSaved} 
      />
    </CardContent>
  </Card>
);