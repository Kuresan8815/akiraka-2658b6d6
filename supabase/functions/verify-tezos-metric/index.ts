
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { TezosToolkit, MichelsonMap } from "https://esm.sh/@taquito/taquito@17.0.0";
import { InMemorySigner } from "https://esm.sh/@taquito/signer@17.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase client initialization
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey
);

// Initialize Tezos
const tezosRPC = Deno.env.get('TEZOS_RPC_URL') || 'https://ghostnet.tezos.marigold.dev';
const privateKey = Deno.env.get('TEZOS_PRIVATE_KEY') || '';
const defaultContractAddress = Deno.env.get('TEZOS_CONTRACT_ADDRESS') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, metricId, value, businessId, contractAddress, productId, productData } = await req.json();

    console.log(`Processing ${action} request`, { metricId, value, businessId, contractAddress, productId });

    // Initialize Tezos toolkit
    const tezos = new TezosToolkit(tezosRPC);
    tezos.setProvider({
      signer: await InMemorySigner.fromSecretKey(privateKey),
    });

    if (action === 'getStorage') {
      // Get contract storage
      const contractAddr = contractAddress || defaultContractAddress;
      console.log(`Fetching storage from contract: ${contractAddr}`);
      
      const contract = await tezos.contract.at(contractAddr);
      const storage = await contract.storage();
      
      console.log('Contract storage retrieved:', storage);
      
      return new Response(
        JSON.stringify({ success: true, storage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    else if (action === 'recordMetric') {
      if (!metricId || value === undefined) {
        throw new Error('Missing required parameters: metricId and value');
      }

      console.log(`Recording metric to blockchain: ID ${metricId}, value ${value}`);
      
      // Get contract instance
      const contract = await tezos.contract.at(defaultContractAddress);
      
      // Call contract method to store the metric
      const op = await contract.methods.recordMetric(
        metricId,
        value.toString(),
        new Date().toISOString(),
        businessId || "unknown"
      ).send();
      
      console.log(`Waiting for confirmation of operation ${op.hash}`);
      await op.confirmation(2); // Wait for 2 confirmations
      
      const blockLevel = await op.includedInBlock();
      console.log(`Operation confirmed in block ${blockLevel}`);
      
      // Update the database with blockchain verification data
      const { data, error } = await supabase
        .from('widget_metrics')
        .update({
          tezos_operation_hash: op.hash,
          tezos_block_level: blockLevel,
          tezos_contract_address: defaultContractAddress,
        })
        .eq('id', metricId)
        .select();
      
      if (error) {
        console.error('Error updating widget_metrics:', error);
        throw error;
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          opHash: op.hash,
          blockLevel,
          contractAddress: defaultContractAddress,
          updatedRecord: data
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    else if (action === 'verifyProduct') {
      if (!productId) {
        throw new Error('Missing required parameter: productId');
      }

      console.log(`Recording product to blockchain: ID ${productId}`);
      
      // Get contract instance
      const contract = await tezos.contract.at(defaultContractAddress);
      
      // Prepare product data for blockchain
      const productDataStr = JSON.stringify({
        id: productId,
        timestamp: new Date().toISOString(),
        ...productData
      });
      
      // Call contract method to store the product verification
      const op = await contract.methods.verifyProduct(
        productId,
        productDataStr
      ).send();
      
      console.log(`Waiting for confirmation of operation ${op.hash}`);
      await op.confirmation(2); // Wait for 2 confirmations
      
      const blockLevel = await op.includedInBlock();
      console.log(`Operation confirmed in block ${blockLevel}`);
      
      // Update the database with blockchain verification data
      const { data, error } = await supabase
        .from('products')
        .update({
          blockchain_tx_id: op.hash,
          blockchain_hash: productDataStr
        })
        .eq('id', productId)
        .select();
      
      if (error) {
        console.error('Error updating products:', error);
        throw error;
      }
      
      // Create an audit log entry
      const { error: auditError } = await supabase
        .from('product_audit_logs')
        .insert({
          product_id: productId,
          action: 'blockchain_verification',
          blockchain_tx_id: op.hash,
          changes: {
            verified_at: new Date().toISOString(),
            blockchain_tx_id: op.hash,
            block_level: blockLevel
          }
        });
      
      if (auditError) {
        console.error('Error creating audit log:', auditError);
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          opHash: op.hash,
          blockLevel,
          contractAddress: defaultContractAddress,
          updatedRecord: data
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    else {
      throw new Error(`Unknown action: ${action}`);
    }
    
  } catch (error) {
    console.error('Error in Tezos verification function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred',
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
