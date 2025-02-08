import { Card } from "@/components/ui/card";
import { MetricHistoryRecord } from "@/types/metrics";

interface MetricHistoryProps {
  history: MetricHistoryRecord[];
  unit: string;
}

export const MetricHistory = ({ history, unit }: MetricHistoryProps) => {
  if (history.length === 0) return null;

  return (
    <Card className="p-4 mt-4">
      <h3 className="text-lg font-semibold mb-2">Update History</h3>
      <div className="space-y-2">
        {history.map((record) => (
          <div key={record.id} className="flex justify-between items-center text-sm">
            <span>Value: {record.value} {unit}</span>
            <span className="text-gray-500">
              {new Date(record.recorded_at).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};