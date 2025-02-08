import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Settings, Link as LinkIcon } from "lucide-react";

export const APIIntegration = () => {
  const { toast } = useToast();

  const handleConnect = () => {
    toast({
      title: "Coming Soon",
      description: "API integration functionality will be available soon",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Settings className="h-8 w-8 text-gray-400" />
            <div>
              <h3 className="font-semibold">IoT Sensors</h3>
              <p className="text-sm text-gray-500">Connect your IoT devices for real-time data</p>
            </div>
          </div>
          <Button onClick={handleConnect}>Connect Sensors</Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <LinkIcon className="h-8 w-8 text-gray-400" />
            <div>
              <h3 className="font-semibold">Utility Providers</h3>
              <p className="text-sm text-gray-500">Sync data from your utility providers</p>
            </div>
          </div>
          <Button onClick={handleConnect}>Connect Provider</Button>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">API Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">API Endpoint</label>
            <Input placeholder="https://api.example.com/data" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            <Input type="password" placeholder="Enter your API key" />
          </div>
          <Button>Save Configuration</Button>
        </div>
      </Card>
    </div>
  );
};