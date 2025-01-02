import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Leaf, Droplets, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ScanHistoryListProps {
  filteredHistory: any[];
  onSelectProduct: (product: any) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const SAMPLE_SCAN = {
  id: "sample",
  scanned_at: new Date().toISOString(),
  products: {
    qr_code_id: "demo",
    name: "Eco-Friendly Water Bottle",
    origin: "Sustainable Factory, Sweden",
    certification_level: "Gold",
    carbon_footprint: 0.5,
    water_usage: 2,
    sustainability_score: 85,
  }
};

export const ScanHistoryList = ({ 
  filteredHistory, 
  onSelectProduct, 
  onRefresh,
  isRefreshing 
}: ScanHistoryListProps) => {
  const scansToDisplay = filteredHistory.length > 0 ? filteredHistory : [SAMPLE_SCAN];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-eco-primary">Recent Scans</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="text-eco-primary hover:text-eco-primary/80"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {scansToDisplay.map((scan) => (
        <Link 
          key={scan.id}
          to={`/scan/${scan.products?.qr_code_id}`}
          className="block"
        >
          <Card
            className="border-eco-primary cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative bg-eco-secondary/40 rounded-t-lg">
              <div className="space-y-1">
                <CardTitle className="text-lg">{scan.products?.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {scan.products?.origin || "Sustainable Manufacturer"}
                </p>
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
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-green-50"
                  >
                    Score: {scan.products?.sustainability_score}/100
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};