
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BlockchainVerificationProps {
  metric: {
    tezos_operation_hash?: string;
    tezos_block_level?: number;
    tezos_contract_address?: string;
  };
}

export const BlockchainVerification = ({ metric }: BlockchainVerificationProps) => {
  const { data: storageData } = useQuery({
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

  if (!metric?.tezos_operation_hash) {
    return <span>Not verified</span>;
  }

  return (
    <div className="space-y-1">
      <span className="text-xs text-gray-500 block">
        Verified on Tezos (Block: {metric.tezos_block_level})
        <br />
        TX: {metric.tezos_operation_hash.slice(0, 8)}...
      </span>
      {storageData && (
        <span className="text-xs text-gray-400 block">
          Contract Storage: {JSON.stringify(storageData).slice(0, 50)}...
        </span>
      )}
    </div>
  );
};
