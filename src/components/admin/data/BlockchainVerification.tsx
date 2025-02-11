
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BlockchainVerificationProps {
  metric: {
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
      
      const { data, error } = await supabase.functions.invoke('verify-tezos-metric', {
        body: {
          action: 'getStorage',
          contractAddress: metric.tezos_contract_address
        }
      });

      if (error) throw error;
      return data.storage;
    },
    enabled: !!metric?.tezos_contract_address
  });

  const handleCheckStorage = async () => {
    try {
      await refetchStorage();
      toast({
        title: "Storage Check Complete",
        description: `Current storage value: ${JSON.stringify(storageData)}`,
      });
    } catch (error) {
      toast({
        title: "Error Checking Storage",
        description: error instanceof Error ? error.message : "Failed to check contract storage",
        variant: "destructive",
      });
    }
  };

  if (!metric?.tezos_operation_hash) {
    return <span>Not verified</span>;
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
