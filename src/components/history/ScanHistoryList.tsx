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

const SAMPLE_SCAN = {
  id: "sample",
  scanned_at: new Date().toISOString(),
  products: {
    qr_code_id: "demo",
    name: "Eco-Friendly Water Bottle",
    origin: "Sustainable Factory, Sweden",
    certification_level: "Gold",
    carbon_footprint: 0.5,
    water_usage: 2,
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
  const scansToDisplay = filteredHistory.length > 0 ? filteredHistory : [SAMPLE_SCAN];

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

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
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};