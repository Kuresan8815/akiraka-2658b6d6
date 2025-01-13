import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Leaf, Droplets, AlertCircle, FileText, Barcode, Database, QrCode, List } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "./ui/card";
import { ProductAuditLog } from "./admin/products/ProductAuditLog";
import { QRCode } from "qrcode.react";

interface ProductDetailsModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailsModal = ({ product, isOpen, onClose }: ProductDetailsModalProps) => {
  if (!product) return null;

  const certificationColor = {
    Bronze: "bg-orange-500",
    Silver: "bg-gray-400",
    Gold: "bg-yellow-500",
  }[product.certification_level];

  const verificationUrl = `${window.location.origin}/verify/${product.id}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-eco-primary flex justify-between items-center">
            {product.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-col gap-2">
                <Badge className={certificationColor}>
                  {product.certification_level} Certified
                </Badge>
                <Badge className="bg-green-500">
                  Sustainability Score: {product.sustainability_score}/100
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="text-eco-primary" />
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-sm text-gray-600">
                      {product.category || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="text-eco-primary" />
                  <div>
                    <p className="text-sm font-medium">Material Composition</p>
                    <p className="text-sm text-gray-600">
                      {product.material_composition || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="text-eco-primary" />
                  <div>
                    <p className="text-sm font-medium">Recyclability</p>
                    <p className="text-sm text-gray-600">
                      {product.recyclability_percentage ? `${product.recyclability_percentage}%` : 'Not specified'}
                    </p>
                  </div>
                </div>

                {product.manufacture_date && (
                  <div className="flex items-center gap-2">
                    <FileText className="text-eco-primary" />
                    <div>
                      <p className="text-sm font-medium">Manufacture Date</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(product.manufacture_date), 'PPP')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Sustainability Metrics */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center gap-2">
                <Leaf className="text-eco-primary" />
                <div>
                  <p className="text-sm font-medium">Carbon Footprint</p>
                  <p className="text-sm text-gray-600">
                    {product.carbon_footprint} kg CO₂
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Droplets className="text-eco-primary" />
                <div>
                  <p className="text-sm font-medium">Water Usage</p>
                  <p className="text-sm text-gray-600">
                    {product.water_usage} liters
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AlertCircle className="text-eco-primary" />
                <div>
                  <p className="text-sm font-medium">Origin</p>
                  <p className="text-sm text-gray-600">{product.origin}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Barcode className="text-eco-primary" />
                <div>
                  <p className="text-sm font-medium">QR Code ID</p>
                  <p className="text-sm text-gray-600">{product.qr_code_id}</p>
                </div>
              </div>

              {product.image_url && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Product Image</p>
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bottom Section - Verification Info */}
          <Card className="md:col-span-2">
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Database className="text-eco-primary" />
                    <div>
                      <p className="text-sm font-medium">Blockchain Verification</p>
                      {product.blockchain_tx_id ? (
                        <p className="text-sm text-gray-600">
                          TX ID: {product.blockchain_tx_id}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Not yet verified on blockchain
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <QrCode className="text-eco-primary" />
                    <div>
                      <p className="text-sm font-medium">Verification QR Code</p>
                      <p className="text-sm text-gray-600">
                        Scan to verify product authenticity
                      </p>
                    </div>
                  </div>

                  <div className="mt-2">
                    <QRCode value={verificationUrl} size={128} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <List className="text-eco-primary" />
                    <div>
                      <p className="text-sm font-medium">Audit Log</p>
                      <p className="text-sm text-gray-600">
                        History of changes to this product
                      </p>
                    </div>
                  </div>
                  <ProductAuditLog productId={product.id} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};