import { useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { QrCode, Camera } from "lucide-react";
import { useToast } from "./ui/use-toast";

export const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode("reader");
      setScanning(true);

      const qrCodeSuccessCallback = (decodedText: string) => {
        html5QrCode.stop();
        setScanning(false);
        navigate(`/product/${decodedText}`);
      };

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        (errorMessage) => {
          console.log(errorMessage);
        }
      );
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not access camera. Please check permissions.",
      });
      setScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <h2 className="text-xl font-semibold text-eco-primary">Scan QR Code</h2>
      <p className="text-sm text-gray-600 text-center">
        Scan the QR code on a product to view its sustainability details
      </p>
      
      {!scanning ? (
        <Button
          onClick={startScanning}
          size="lg"
          className="bg-eco-primary hover:bg-eco-secondary"
        >
          <QrCode className="mr-2" />
          Start Scanning
        </Button>
      ) : (
        <div className="relative w-full max-w-sm aspect-square">
          <div
            id="reader"
            className="w-full h-full rounded-lg overflow-hidden"
          ></div>
          <div className="absolute inset-0 border-2 border-eco-primary rounded-lg pointer-events-none">
            <div className="absolute inset-16 border border-white/50"></div>
          </div>
        </div>
      )}

      {scanning && (
        <Button
          variant="outline"
          onClick={() => {
            const html5QrCode = new Html5Qrcode("reader");
            html5QrCode.stop();
            setScanning(false);
          }}
        >
          Stop Scanning
        </Button>
      )}
    </div>
  );
};