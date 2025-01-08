import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Leaf, Droplets, Clock } from "lucide-react";
import { format } from "date-fns";

interface ScanCardProps {
  scan: any;
  onClick: () => void;
}

export const ScanCard = ({ scan, onClick }: ScanCardProps) => {
  return (
    <div onClick={onClick} className="block cursor-pointer">
      <Card className="border-eco-primary transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative bg-eco-secondary/40 rounded-t-lg">
          <div className="space-y-1">
            <CardTitle className="text-lg">{scan.products?.name}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              {format(new Date(scan.scanned_at), "PPp")}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                scan.products?.certification_level === "Gold"
                  ? "default"
                  : scan.products?.certification_level === "Silver"
                  ? "secondary"
                  : "outline"
              }
            >
              {scan.products?.certification_level}
            </Badge>
            <ExternalLink className="h-4 w-4 text-eco-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <Leaf className="h-4 w-4 text-eco-primary mr-2" />
                <span className="text-sm">
                  {scan.products?.carbon_footprint} kg CO₂ saved
                </span>
              </div>
              <div className="flex items-center">
                <Droplets className="h-4 w-4 text-eco-primary mr-2" />
                <span className="text-sm">
                  {scan.products?.water_usage} L saved
                </span>
              </div>
              <Badge variant="outline" className="text-xs bg-green-50">
                Score: {scan.products?.sustainability_score}/100
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};