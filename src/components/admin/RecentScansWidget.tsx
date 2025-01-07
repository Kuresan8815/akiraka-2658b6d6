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
      return [
        {
          id: "1",
          scanned_at: new Date().toISOString(),
          products: { name: "Organic Cotton T-Shirt", certification_level: "Gold" },
          user_id: "user1"
        },
        {
          id: "2",
          scanned_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          products: { name: "Eco-Friendly Water Bottle", certification_level: "Silver" },
          user_id: "user2"
        },
        {
          id: "3",
          scanned_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          products: { name: "Bamboo Toothbrush", certification_level: "Gold" },
          user_id: "user3"
        }
      ] as ScanHistoryItem[];
    },
  });

  const { data: userNames } = useQuery({
    queryKey: ["user-names"],
    queryFn: async () => {
      return {
        user1: "Emma Thompson",
        user2: "James Wilson",
        user3: "Sarah Parker"
      };
    },
    enabled: !!recentScans?.length,
  });

  return (
    <Card className="animate-fade-up">
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
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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