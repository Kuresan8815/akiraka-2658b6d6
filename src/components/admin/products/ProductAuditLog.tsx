import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ProductAuditLogProps {
  productId: string;
}

interface AuditLog {
  id: string;
  action: string;
  changes: any;
  created_at: string;
  created_by: string | null;
  profiles?: {
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
          *,
          profiles (
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
    <div className="space-y-2">
      {auditLogs.map((log) => (
        <div key={log.id} className="text-sm">
          <p className="font-medium">{log.action}</p>
          <p className="text-gray-600">
            By: {log.profiles?.name || "Unknown"}
          </p>
          <p className="text-gray-600">
            {format(new Date(log.created_at), "PPp")}
          </p>
          {log.changes && (
            <pre className="mt-1 text-xs bg-gray-50 p-2 rounded">
              {JSON.stringify(log.changes, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
};