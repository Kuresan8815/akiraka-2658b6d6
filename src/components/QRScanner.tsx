
import { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useToast } from "@/components/ui/use-toast";

interface QRScannerProps {
  onResult: (result: string) => void;
}

export const QRScanner = ({ onResult }: QRScannerProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let html5QrCode: Html5Qrcode;

    const initializeScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader");
        setIsInitialized(true);

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            html5QrCode.stop();
            onResult(decodedText);
          },
          (errorMessage) => {
            console.log(errorMessage);
          }
        );
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Camera Error",
          description: "Could not access camera. Please check permissions.",
        });
        console.error("QR Scanner Error:", err);
      }
    };

    if (!isInitialized) {
      initializeScanner();
    }

    return () => {
      if (html5QrCode?.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [isInitialized, onResult, toast]);

  return (
    <div id="reader" className="w-full h-full" />
  );
};
