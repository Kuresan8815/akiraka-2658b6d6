import { ScanHistoryList } from "./ScanHistoryList";

interface PreviousScansProps {
  scans: any[];
  onSelectProduct: (product: any) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const PreviousScans = ({
  scans,
  onSelectProduct,
  onRefresh,
  isRefreshing,
}: PreviousScansProps) => {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-eco-primary mb-4">Previous Scans</h3>
      <ScanHistoryList
        filteredHistory={scans}
        onSelectProduct={onSelectProduct}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />
    </div>
  );
};