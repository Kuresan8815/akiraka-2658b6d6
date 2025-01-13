import { Database, QrCode, List } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProductAuditLog } from "../admin/products/ProductAuditLog";
import { QRCode } from "qrcode.react";
import { Product } from "@/types/product";

interface ProductVerificationInfoProps {
  product: Product;
  verificationUrl: string;
}

export const ProductVerificationInfo = ({ product, verificationUrl }: ProductVerificationInfoProps) => {
  return (
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
  );
};