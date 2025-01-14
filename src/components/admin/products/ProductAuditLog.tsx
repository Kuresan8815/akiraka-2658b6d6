import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Json } from "@/integrations/supabase/types";

interface ProductAuditLogProps {
  productId: string;
}

interface AuditLog {
  id: string;
  action: string;
  changes: Json;
  created_at: string;
  created_by: string | null;
  user_profile?: {
    name: string | null;
  } | null;
}

export const ProductAuditLog = ({ productId }: ProductAuditLogProps) => {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["product-audit-logs", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_audit_logs")
        .select(`
          id,
          action,
          changes,
          created_at,
          created_by,
          user_profile:profiles!product_audit_logs_created_by_fkey (
            name
          )
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AuditLog[];
    },
  });

  if (isLoading) {
    return <div>Loading audit logs...</div>;
  }

  if (!auditLogs?.length) {
    return <div>No audit logs found</div>;
  }

  return (
    <div className="space-y-4">
      {auditLogs.map((log) => (
        <div key={log.id} className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">{log.action}</h3>
              <p className="text-sm text-gray-500">
                By: {log.user_profile?.name || "Unknown"}
              </p>
            </div>
            <time className="text-sm text-gray-500">
              {format(new Date(log.created_at), "PPp")}
            </time>
          </div>
          {log.changes && (
            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
              {JSON.stringify(log.changes, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
};