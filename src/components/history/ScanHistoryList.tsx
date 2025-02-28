
import { useState } from "react";
import { ProductDetailsModal } from "../ProductDetailsModal";
import { ScanCard } from "./ScanCard";
import { ScanListHeader } from "./ScanListHeader";

interface ScanHistoryListProps {
  filteredHistory: any[];
  onSelectProduct: (product: any) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const DEMO_SCAN = {
  id: "demo",
  scanned_at: new Date().toISOString(),
  products: {
    id: "demo",
    name: "Eco-Friendly Water Bottle",
    certification_level: "Gold",
    carbon_footprint: 0.5,
    water_usage: 2,
    origin: "Sustainable Factory, Sweden",
    qr_code_id: "demo",
    sustainability_score: 85,
  }
};

export const ScanHistoryList = ({ 
  filteredHistory, 
  onSelectProduct, 
  onRefresh,
  isRefreshing 
}: ScanHistoryListProps) => {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Always show the demo scan
  const scansToDisplay = [DEMO_SCAN, ...filteredHistory];

  return (
    <div className="space-y-4">
      <ScanListHeader onRefresh={onRefresh} isRefreshing={isRefreshing} />

      {scansToDisplay.map((scan) => (
        <ScanCard
          key={scan.id}
          scan={scan}
          onClick={() => handleProductClick(scan.products)}
        />
      ))}

      <ProductDetailsModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};
