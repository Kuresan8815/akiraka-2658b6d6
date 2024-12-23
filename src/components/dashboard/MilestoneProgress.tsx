import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MilestoneProgressProps {
  scannedProducts: number;
  targetProducts: number;
}

export const MilestoneProgress = ({ scannedProducts, targetProducts }: MilestoneProgressProps) => {
  const progress = Math.min((scannedProducts / targetProducts) * 100, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Milestone Progress</CardTitle>
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