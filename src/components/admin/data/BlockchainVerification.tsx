
interface BlockchainVerificationProps {
  metric: {
    tezos_operation_hash?: string;
    tezos_block_level?: number;
  };
}

export const BlockchainVerification = ({ metric }: BlockchainVerificationProps) => {
  if (!metric?.tezos_operation_hash) {
    return <span>Not verified</span>;
  }

  return (
    <span className="text-xs text-gray-500">
      Verified on Tezos (Block: {metric.tezos_block_level})
      <br />
      TX: {metric.tezos_operation_hash.slice(0, 8)}...
    </span>
  );
};
