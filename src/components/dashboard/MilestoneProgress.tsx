import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MilestoneProgressProps {
  scannedProducts: number;
  targetProducts: number;
}

export const MilestoneProgress = ({ scannedProducts, targetProducts }: MilestoneProgressProps) => {
  const progress = Math.min((scannedProducts / targetProducts) * 100, 100);

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 shadow-[4px_4px_10px_rgba(0,0,0,0.1),-2px_-2px_10px_rgba(255,255,255,0.8)] border border-gray-100">
      <CardHeader className="bg-eco-secondary/40 rounded-t-lg">
        <CardTitle className="text-lg text-eco-primary">Milestone Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500">
            {scannedProducts}/{targetProducts} eco-friendly products scanned
          </p>
        </div>
      </CardContent>
    </Card>
  );
};