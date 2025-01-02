import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Package } from "lucide-react";

interface MilestoneProgressProps {
  scannedProducts: number;
  targetProducts: number;
}

export const MilestoneProgress = ({ scannedProducts, targetProducts }: MilestoneProgressProps) => {
  const progress = Math.min((scannedProducts / targetProducts) * 100, 100);

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 shadow-[4px_4px_10px_rgba(0,0,0,0.1),-2px_-2px_10px_rgba(255,255,255,0.8)] border border-gray-100">
      <CardHeader className="bg-eco-secondary/40 rounded-t-lg flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-eco-primary">Product Scanning Milestone</CardTitle>
        <Package className="h-5 w-5 text-eco-primary" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {scannedProducts}/{targetProducts} eco-friendly products scanned
            </p>
            <span className="text-sm font-medium text-eco-primary">{Math.round(progress)}%</span>
          </div>
          <p className="text-xs text-gray-400">
            {targetProducts - scannedProducts} more scans until next milestone
          </p>
        </div>
      </CardContent>
    </Card>
  );
};