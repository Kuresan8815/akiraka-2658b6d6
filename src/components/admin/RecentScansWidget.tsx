import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

export const RecentScansWidget = () => {
  const { data: recentScans, isLoading } = useQuery({
    queryKey: ["recent-scans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scan_history")
        .select(`
          *,
          products (name, certification_level),
          profiles (name)
        `)
        .order("scanned_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-eco-primary">Recent Scans</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading recent scans...</p>
        ) : (
          <div className="space-y-4">
            {recentScans?.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{scan.products?.name}</p>
                  <p className="text-sm text-gray-500">
                    by {scan.profiles?.name || "Anonymous"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-eco-primary">
                    {scan.products?.certification_level}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(scan.scanned_at), "PPp")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};