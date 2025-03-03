
import { supabase } from "@/integrations/supabase/client";

/**
 * Represents the status of a blockchain transaction
 */
export type BlockchainVerificationStatus = "pending" | "success" | "failed";

/**
 * Interface for blockchain verification result
 */
export interface BlockchainVerificationResult {
  status: BlockchainVerificationStatus;
  message: string;
  transaction_hash?: string;
  block_level?: number;
  contract_address?: string;
  error?: string;
}

/**
 * Interface for verification payload for metrics
 */
export interface MetricVerificationPayload {
  metricId: string;
  value: number;
  businessId: string;
}

/**
 * Interface for verification payload for products
 */
export interface ProductVerificationPayload {
  productId: string;
  productData: {
    name: string;
    certification_level: string;
    carbon_footprint: number;
    water_usage: number;
    sustainability_score: number;
    origin: string;
    [key: string]: any;
  };
}

/**
 * Verify a metric on the Tezos blockchain
 * @param metricData The metric data to verify
 * @returns Promise resolving to verification result
 */
export async function verifyMetricOnBlockchain(
  metricData: MetricVerificationPayload
): Promise<BlockchainVerificationResult> {
  try {
    console.log("Starting metric verification process:", metricData);
    
    const payload = {
      action: 'recordMetric',
      ...metricData
    };

    const { data, error } = await supabase.functions.invoke('verify-tezos-metric', {
      body: payload
    });

    if (error) {
      console.error("Blockchain verification error:", error);
      return {
        status: "failed",
        message: `Verification failed: ${error.message}`,
        error: error.message
      };
    }

    if (!data || data.error) {
      console.error("Blockchain service returned error:", data?.error);
      return {
        status: "failed",
        message: `Verification failed: ${data?.error || "Unknown error"}`,
        error: data?.error || "Unknown error"
      };
    }

    console.log("Blockchain verification successful:", data);
    return {
      status: "success",
      message: "Successfully verified on Tezos blockchain",
      transaction_hash: data.transactionHash,
      block_level: data.blockLevel,
      contract_address: data.contractAddress
    };
  } catch (error) {
    console.error("Unexpected error during blockchain verification:", error);
    return {
      status: "failed",
      message: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Verify a product on the Tezos blockchain
 * @param productData The product data to verify
 * @returns Promise resolving to verification result
 */
export async function verifyProductOnBlockchain(
  productData: ProductVerificationPayload
): Promise<BlockchainVerificationResult> {
  try {
    console.log("Starting product verification process:", productData);
    
    const payload = {
      action: 'verifyProduct',
      ...productData
    };

    const { data, error } = await supabase.functions.invoke('verify-tezos-metric', {
      body: payload
    });

    if (error) {
      console.error("Blockchain verification error:", error);
      return {
        status: "failed",
        message: `Verification failed: ${error.message}`,
        error: error.message
      };
    }

    if (!data || data.error) {
      console.error("Blockchain service returned error:", data?.error);
      return {
        status: "failed",
        message: `Verification failed: ${data?.error || "Unknown error"}`,
        error: data?.error || "Unknown error"
      };
    }

    console.log("Product blockchain verification successful:", data);
    return {
      status: "success",
      message: "Successfully verified on Tezos blockchain",
      transaction_hash: data.transactionHash,
      block_level: data.blockLevel,
      contract_address: data.contractAddress
    };
  } catch (error) {
    console.error("Unexpected error during product verification:", error);
    return {
      status: "failed",
      message: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Get blockchain contract storage data
 * @param contractAddress The contract address to query
 * @returns Promise resolving to the contract storage data
 */
export async function getBlockchainContractStorage(contractAddress: string): Promise<any> {
  try {
    console.log("Fetching contract storage for:", contractAddress);
    
    const { data, error } = await supabase.functions.invoke('verify-tezos-metric', {
      body: {
        action: 'getStorage',
        contractAddress
      }
    });

    if (error) {
      console.error("Contract storage fetch error:", error);
      throw error;
    }

    if (!data || data.error) {
      console.error("Contract storage service returned error:", data?.error);
      throw new Error(data?.error || "Unknown error");
    }

    console.log("Contract storage fetch successful:", data.storage);
    return data.storage;
  } catch (error) {
    console.error("Failed to fetch contract storage:", error);
    throw error;
  }
}
