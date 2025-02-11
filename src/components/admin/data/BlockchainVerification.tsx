
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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

  const { data: storageData, refetch: refetchStorage } = useQuery({
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
    } catch (error) {
      console.error('Failed to record metric:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record metric on blockchain",
        variant: "destructive",
      });
    }
  };

  const handleCheckStorage = async () => {
    try {
      await refetchStorage();
      toast({
        title: "Storage Check Complete",
        description: `Current storage value: ${JSON.stringify(storageData)}`,
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
      <div className="space-y-2">
        <span>Not verified</span>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleRecordMetric}
          className="text-xs"
        >
          Record on Blockchain
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500">
        Verified on Tezos (Block: {metric.tezos_block_level})
        <br />
        TX: {metric.tezos_operation_hash.slice(0, 8)}...
      </div>
      
      {storageData && (
        <div className="text-xs text-gray-400">
          Contract Storage: {JSON.stringify(storageData).slice(0, 50)}...
        </div>
      )}
      
      <Button 
        size="sm" 
        variant="outline" 
        onClick={handleCheckStorage}
        className="text-xs"
      >
        Check Storage
      </Button>
    </div>
  );
};
