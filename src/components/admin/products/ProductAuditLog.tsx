
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ProductAuditLogProps {
  productId: string;
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
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading audit history...</div>;
  }

  return (
    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Update History</h4>
        {auditLogs?.map((log) => (
          <div key={log.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {format(new Date(log.created_at), "PPp")}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {log.action}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(log.changes, null, 2)}
              </pre>
            </div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
