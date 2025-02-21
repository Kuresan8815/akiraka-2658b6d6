
import { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onResult: (result: string) => void;
}

export const QRScanner = ({ onResult }: QRScannerProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const { toast } = useToast();

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Clean up the stream
      setPermissionDenied(false);
      setIsInitialized(true);
    } catch (err) {
      console.error("Camera permission error:", err);
      setPermissionDenied(true);
      toast({
        variant: "destructive",
        title: "Camera Access Required",
        description: "Please enable camera access in your browser settings to scan QR codes.",
      });
    }
  };

  useEffect(() => {
    let html5QrCode: Html5Qrcode;

    const initializeScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader");

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
            console.log("QR Scan error:", errorMessage);
          }
        );
      } catch (err) {
        console.error("Scanner initialization error:", err);
        setPermissionDenied(true);
      }
    };

    if (isInitialized && !permissionDenied) {
      initializeScanner();
    }

    return () => {
      if (html5QrCode?.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [isInitialized, onResult, permissionDenied]);

  if (permissionDenied) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            Camera access is required to scan QR codes. Please enable camera access in your browser settings.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={requestCameraPermission}
          className="w-full"
        >
          Grant Camera Access
        </Button>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            Camera access is needed to scan QR codes.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={requestCameraPermission}
          className="w-full"
        >
          Enable Camera
        </Button>
      </div>
    );
  }

  return (
    <div id="reader" className="w-full h-full" />
  );
};
