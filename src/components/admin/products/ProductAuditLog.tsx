import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List, Calendar, User } from "lucide-react";

interface ProductAuditLogProps {
  productId: string;
}

export const ProductAuditLog = ({ productId }: ProductAuditLogProps) => {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["product-audit-logs", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_audit_logs")
        .select(`
          *,
          created_by_profile:profiles!product_audit_logs_created_by_fkey(name)
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading audit logs...</div>;
  }

  return (
    <ScrollArea className="h-[200px] w-full">
      <div className="space-y-4">
        {auditLogs?.map((log) => (
          <div key={log.id} className="flex items-start gap-3 text-sm">
            <div className="flex-shrink-0">
              {log.action === "update" && <List className="h-4 w-4 text-blue-500" />}
              {log.action === "delete" && <List className="h-4 w-4 text-red-500" />}
              {log.action === "create" && <List className="h-4 w-4 text-green-500" />}
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {log.action.charAt(0).toUpperCase() + log.action.slice(1)} action
              </p>
              {log.changes && (
                <pre className="mt-1 text-xs text-gray-500">
                  {JSON.stringify(log.changes, null, 2)}
                </pre>
              )}
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(log.created_at), "PPp")}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {log.created_by_profile?.name || "Unknown user"}
                </span>
              </div>
              {log.blockchain_tx_id && (
                <p className="mt-1 text-xs text-gray-500">
                  TX: {log.blockchain_tx_id}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};