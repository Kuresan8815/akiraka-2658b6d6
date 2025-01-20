import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

export const BulkDataUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Here we'll implement the file upload logic
    // For now, just show a toast
    toast({
      title: "Coming Soon",
      description: "Bulk upload functionality will be available soon",
    });

    setIsUploading(false);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold">Upload Data File</h3>
        <p className="mt-1 text-sm text-gray-500">CSV or Excel files supported</p>
        
        <div className="mt-4">
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button 
              disabled={isUploading}
              className="cursor-pointer"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              {isUploading ? "Uploading..." : "Select File"}
            </Button>
          </label>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-md">
        <p className="text-sm text-yellow-800">
          Note: Please ensure your file follows the required format. Download our template for reference.
        </p>
      </div>
    </div>
  );
};