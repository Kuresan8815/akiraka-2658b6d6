import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Leaf, Droplets } from "lucide-react";
import { format } from "date-fns";

interface ScanHistoryListProps {
  filteredHistory: any[];
  onSelectProduct: (product: any) => void;
}

export const ScanHistoryList = ({ filteredHistory, onSelectProduct }: ScanHistoryListProps) => {
  return (
    <div className="space-y-4">
      {filteredHistory?.map((scan) => (
        <Card
          key={scan.id}
          className="border-eco-primary cursor-pointer transition-transform hover:scale-[1.02]"
          onClick={() => onSelectProduct(scan.products)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative bg-eco-secondary/40 rounded-t-lg">
            <CardTitle className="text-lg">{scan.products?.name}</CardTitle>
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
              <p className="text-sm text-gray-500">
                Scanned on {format(new Date(scan.scanned_at), "PPp")}
              </p>
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
                <div className="flex items-center">
                  <Badge variant="outline" className="text-xs">
                    Score: {scan.products?.sustainability_score}/100
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};