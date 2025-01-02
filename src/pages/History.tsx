import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { AlertCircle, Droplets, Leaf, CalendarIcon, ExternalLink, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export default function History() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data: scanHistory, isLoading, error, refetch } = useQuery({
    queryKey: ["scan_history"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("scan_history")
        .select("*, products(*)")
        .eq("user_id", user.id)
        .order("scanned_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredHistory = scanHistory?.filter((scan) => {
    if (!dateRange?.from && !dateRange?.to) return true;
    
    const scanDate = parseISO(scan.scanned_at);
    const isAfterStart = !dateRange.from || isAfter(scanDate, dateRange.from);
    const isBeforeEnd = !dateRange.to || isBefore(scanDate, dateRange.to);
    
    return isAfterStart && isBeforeEnd;
  });

  const clearFilters = () => {
    setDateRange(undefined);
  };

  const renderProductDetails = (product) => {
    if (!product) return null;
    
    const certificationColor = {
      Bronze: "bg-orange-500",
      Silver: "bg-gray-400",
      Gold: "bg-yellow-500",
    }[product.certification_level];

    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Badge className={certificationColor}>
            {product.certification_level} Certified
          </Badge>
          <Badge className="bg-green-500">
            Sustainability Score: {product.sustainability_score}/100
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Leaf className="text-eco-primary" />
            <div>
              <p className="text-sm font-medium">Carbon Footprint</p>
              <p className="text-sm text-gray-600">
                {product.carbon_footprint} kg CO₂
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Droplets className="text-eco-primary" />
            <div>
              <p className="text-sm font-medium">Water Usage</p>
              <p className="text-sm text-gray-600">
                {product.water_usage} liters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AlertCircle className="text-eco-primary" />
            <div>
              <p className="text-sm font-medium">Origin</p>
              <p className="text-sm text-gray-600">{product.origin}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-semibold">Unable to load history</h3>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-4 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-eco-primary">Scan History</h2>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange?.from && !dateRange?.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Filter by date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            {(dateRange?.from || dateRange?.to) && (
              <Button
                variant="ghost"
                className="text-muted-foreground"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {filteredHistory?.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No scans found</h3>
            <p className="text-muted-foreground">
              {dateRange?.from || dateRange?.to
                ? "No scans found for the selected dates. Try adjusting your filter."
                : "Start scanning products to build your history!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory?.map((scan) => (
              <Dialog key={scan.id}>
                <DialogTrigger asChild>
                  <Card className="border-eco-primary cursor-pointer transition-transform hover:scale-[1.02]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative bg-eco-secondary/40 rounded-t-lg">
                      <CardTitle className="text-lg">{scan.products?.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          scan.products?.certification_level === 'Gold' ? 'default' :
                          scan.products?.certification_level === 'Silver' ? 'secondary' :
                          'outline'
                        }>
                          {scan.products?.certification_level}
                        </Badge>
                        <ExternalLink className="h-4 w-4 text-eco-primary" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500">
                          Scanned on {format(new Date(scan.scanned_at), 'PPp')}
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center">
                            <Leaf className="h-4 w-4 text-eco-primary mr-2" />
                            <span className="text-sm">{scan.products?.carbon_footprint} kg CO₂ saved</span>
                          </div>
                          <div className="flex items-center">
                            <Droplets className="h-4 w-4 text-eco-primary mr-2" />
                            <span className="text-sm">{scan.products?.water_usage} L saved</span>
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
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl text-eco-primary flex justify-between items-center">
                      {scan.products?.name}
                    </DialogTitle>
                  </DialogHeader>
                  {renderProductDetails(scan.products)}
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}