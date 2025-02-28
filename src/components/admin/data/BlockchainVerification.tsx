
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, ExternalLink, FileText, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface BlockchainVerificationProps {
  metric: {
    id?: string;
    value?: number;
    tezos_operation_hash?: string;
    tezos_block_level?: number;
    tezos_contract_address?: string;
  };
}

export const BlockchainVerification = ({ metric }: BlockchainVerificationProps) => {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: storageData, refetch: refetchStorage, isLoading: isStorageLoading } = useQuery({
    queryKey: ['tezos-storage', metric?.tezos_contract_address],
    queryFn: async () => {
      if (!metric?.tezos_contract_address) return null;
      
      try {
        console.log('Calling verify-tezos-metric function with params:', {
          action: 'getStorage',
          contractAddress: metric.tezos_contract_address
        });

        const { data, error } = await supabase.functions.invoke('verify-tezos-metric', {
          body: {
            action: 'getStorage',
            contractAddress: metric.tezos_contract_address
          }
        });

        if (error) {
          console.error('Edge function error:', error);
          throw error;
        }

        console.log('Edge function response:', data);
        return data.storage;
      } catch (error) {
        console.error('Failed to call edge function:', error);
        throw error;
      }
    },
    enabled: !!metric?.tezos_contract_address,
    retry: 1
  });

  const handleRecordMetric = async () => {
    if (!metric.id || !metric.value) {
      toast({
        title: "Error",
        description: "Missing metric data",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const payload = {
        action: 'recordMetric',
        metricId: metric.id,
        value: metric.value,
        businessId: "test-business" // This should be dynamic based on context
      };

      console.log('Recording metric on blockchain:', payload);

      const { data, error } = await supabase.functions.invoke('verify-tezos-metric', {
        body: payload
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Record metric response:', data);
      toast({
        title: "Success",
        description: "Metric recorded on blockchain",
      });
      
      // Refresh the component to show the new blockchain data
      window.location.reload();
    } catch (error) {
      console.error('Failed to record metric:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record metric on blockchain",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleViewOnBlockchain = () => {
    if (metric?.tezos_operation_hash) {
      // Tezos block explorer URL for the transaction
      const blockExplorerUrl = `https://tzkt.io/${metric.tezos_operation_hash}`;
      window.open(blockExplorerUrl, '_blank');
    }
  };

  const handleCheckStorage = async () => {
    try {
      await refetchStorage();
      toast({
        title: "Storage Check Complete",
        description: "Contract storage data has been refreshed",
      });
    } catch (error) {
      console.error('Storage check error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check contract storage",
        variant: "destructive",
      });
    }
  };

  if (!metric?.tezos_operation_hash) {
    return (
      <div className="border border-yellow-100 bg-yellow-50 rounded-md p-3 space-y-3">
        <div className="flex items-center">
          <ExternalLink className="h-4 w-4 text-yellow-600 mr-2" />
          <span className="text-sm font-medium text-yellow-700">Not verified on blockchain</span>
        </div>
        <p className="text-xs text-yellow-600">
          This metric is not yet verified on the blockchain. Verify it to make it immutable and visible in analytics.
        </p>
        <Button 
          size="sm" 
          variant="default" 
          onClick={handleRecordMetric}
          disabled={isVerifying}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Verify on Blockchain
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="border border-green-100 bg-green-50 rounded-md p-3 space-y-3">
      <div className="flex items-center">
        <Check className="h-4 w-4 text-green-600 mr-2" />
        <span className="text-sm font-medium text-green-700">Verified on Tezos Blockchain</span>
      </div>
      
      <div className="text-xs text-gray-600 flex flex-wrap justify-between items-center">
        <span>Block: {metric.tezos_block_level || 'Unknown'}</span>
        <div className="flex items-center space-x-1">
          <span className="truncate max-w-[100px]">TX: {metric.tezos_operation_hash?.slice(0, 8)}...</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleViewOnBlockchain}>
                  <FileText className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View on Blockchain Explorer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full text-xs">
            {isDetailsOpen ? "Hide Details" : "Show Contract Details"}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-2">
          {isStorageLoading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-xs">Loading contract data...</span>
            </div>
          ) : storageData ? (
            <div className="text-xs bg-white p-2 rounded border border-gray-100 max-h-[100px] overflow-auto">
              <pre className="whitespace-pre-wrap break-all">{JSON.stringify(storageData, null, 2)}</pre>
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No contract data available</p>
          )}
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleCheckStorage}
            className="text-xs w-full"
            disabled={isStorageLoading}
          >
            {isStorageLoading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Checking...
              </>
            ) : (
              "Refresh Contract Data"
            )}
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
