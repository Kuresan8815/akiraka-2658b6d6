
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ProductAuditLogProps {
  productId: string;
}

interface AuditLogChanges {
  before: Record<string, any>;
  after: Record<string, any>;
}

interface AuditLog {
  id: string;
  product_id: string;
  changes: AuditLogChanges;
  created_at: string;
  created_by: string | null;
  action: string;
  blockchain_tx_id: string | null;
}

interface RawAuditLog {
  id: string;
  product_id: string;
  changes: string | Record<string, any>;
  created_at: string;
  created_by: string | null;
  action: string;
  blockchain_tx_id: string | null;
}

export const ProductAuditLog = ({ productId }: ProductAuditLogProps) => {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["product-audit", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_audit_logs")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform the raw data into the correct type
      return (data as RawAuditLog[]).map(log => ({
        ...log,
        changes: typeof log.changes === 'string' 
          ? JSON.parse(log.changes) 
          : log.changes
      })) as AuditLog[];
    },
  });

  if (isLoading) {
    return <div>Loading audit history...</div>;
  }

  return (
    <ScrollArea className="h-[400px] w-full rounded-md">
      <div className="space-y-4 pr-4">
        {auditLogs?.map((log) => {
          const changes = log.changes;
          const changedFields = Object.keys(changes.after).filter(
            (key) => JSON.stringify(changes.after[key]) !== JSON.stringify(changes.before[key])
          );

          return (
            <div key={log.id} className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {format(new Date(log.created_at), "PPp")}
              </div>
              <div className="text-sm space-y-1">
                {changedFields.map((field) => (
                  <div key={field} className="grid grid-cols-[1fr,auto] gap-2">
                    <span className="font-medium capitalize">{field.replace(/_/g, " ")}:</span>
                    <span className="text-muted-foreground">
                      {String(changes.before[field])} → {String(changes.after[field])}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-2" />
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
