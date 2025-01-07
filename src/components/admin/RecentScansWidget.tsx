import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

interface ScanHistoryItem {
  id: string;
  scanned_at: string;
  products: {
    name: string;
    certification_level: string;
  } | null;
  user_id: string;
}

export const RecentScansWidget = () => {
  const { data: recentScans, isLoading } = useQuery({
    queryKey: ["recent-scans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scan_history")
        .select(`
          id,
          scanned_at,
          user_id,
          products (name, certification_level)
        `)
        .order("scanned_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as ScanHistoryItem[];
    },
  });

  const { data: userNames } = useQuery({
    queryKey: ["user-names", recentScans?.map(scan => scan.user_id)],
    queryFn: async () => {
      if (!recentScans?.length) return {};
      
      const { data } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", recentScans.map(scan => scan.user_id));
      
      return data?.reduce((acc, profile) => ({
        ...acc,
        [profile.id]: profile.name
      }), {} as Record<string, string | null>) || {};
    },
    enabled: !!recentScans?.length,
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
                  <p className="font-medium">{scan.products?.name || "Unknown Product"}</p>
                  <p className="text-sm text-gray-500">
                    by {userNames?.[scan.user_id] || "Anonymous"}
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