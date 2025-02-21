
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRScanner } from '@/components/QRScanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Camera, X } from 'lucide-react';

export const Scan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleScanResult = (result: string) => {
    // Extract product ID from the verification URL
    const productId = result.split('/verify/')[1];
    
    if (productId) {
      // Navigate to product details page
      navigate(`/product/${productId}`);
    } else {
      toast({
        title: "Invalid QR Code",
        description: "This QR code is not a valid product verification code.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen pb-20">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center text-eco-primary">
          Scan Product
        </h1>

        <Card>
          <CardContent className="pt-6">
            {!isScanning ? (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">Ready to scan a product?</p>
                  <p className="text-sm text-muted-foreground">
                    Position the QR code within the camera frame to verify your product's authenticity.
                  </p>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => setIsScanning(true)}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Start Scanning
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-black">
                  <QRScanner onResult={handleScanResult} />
                  <div className="absolute inset-0 border-2 border-eco-primary rounded-lg pointer-events-none">
                    <div className="absolute inset-16 border border-white/50"></div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsScanning(false)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Stop Scanning
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Having trouble scanning?</p>
          <p>Make sure the QR code is well-lit and centered in the frame.</p>
        </div>
      </div>
    </div>
  );
};

export default Scan;
