
import { Badge } from "@/components/ui/badge";

interface ReportStatusBadgeProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export const ReportStatusBadge = ({ status }: ReportStatusBadgeProps) => {
  const variant = 
    status === 'completed' ? 'default' :
    status === 'failed' ? 'destructive' :
    'secondary';

  return (
    <Badge variant={variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
