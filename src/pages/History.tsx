import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AlertCircle, Droplets, Leaf } from "lucide-react";

export default function History() {
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
        <h2 className="text-2xl font-bold text-eco-primary mb-6">Scan History</h2>
        {scanHistory?.map((scan) => (
          <Card key={scan.id} className="border-eco-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">{scan.products?.name}</CardTitle>
              <Badge variant={
                scan.products?.certification_level === 'Gold' ? 'default' :
                scan.products?.certification_level === 'Silver' ? 'secondary' :
                'outline'
              }>
                {scan.products?.certification_level}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Scanned on {format(new Date(scan.scanned_at), 'PPp')}
                </p>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <Leaf className="h-4 w-4 text-eco-primary mr-2" />
                    <span className="text-sm">{scan.products?.carbon_footprint} kg CO₂ saved</span>
                  </div>
                  <div className="flex items-center">
                    <Droplets className="h-4 w-4 text-eco-primary mr-2" />
                    <span className="text-sm">{scan.products?.water_usage} L saved</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}