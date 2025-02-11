
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { TezosToolkit } from 'https://esm.sh/@taquito/taquito@14.0.0';
import { InMemorySigner } from 'https://esm.sh/@taquito/signer@14.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body and log it
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body));
    
    const { metricId, value, businessId, action, contractAddress } = body;
    console.log('Processing Tezos request:', { metricId, value, businessId, action, contractAddress });

    // Log configuration details (without private key)
    const rpcUrl = Deno.env.get('TEZOS_RPC_URL');
    console.log('Using Tezos RPC URL:', rpcUrl);

    if (!rpcUrl) {
      throw new Error('TEZOS_RPC_URL is not configured');
    }

    // Initialize Tezos client
    const Tezos = new TezosToolkit(rpcUrl);
    const privateKey = Deno.env.get('TEZOS_PRIVATE_KEY');
    if (!privateKey) {
      throw new Error('TEZOS_PRIVATE_KEY is not configured');
    }

    const signer = await InMemorySigner.fromSecretKey(privateKey);
    await Tezos.setProvider({ signer });
    console.log('Tezos client initialized successfully');

    let result;
    let contract;
    
    // Get the contract instance using provided address or default
    const targetContract = contractAddress || Deno.env.get('TEZOS_CONTRACT_ADDRESS');
    if (!targetContract) {
      throw new Error('No contract address provided');
    }

    console.log('Connecting to Tezos contract:', targetContract);
    contract = await Tezos.wallet.at(targetContract);
    console.log('Successfully connected to contract');
    
    switch (action) {
      case 'getStorage':
        console.log('Fetching storage for contract:', targetContract);
        const storage = await contract.storage();
        console.log('Contract storage:', storage);
        result = { storage };
        break;

      case 'recordMetric':
        if (!metricId || !value || !businessId) {
          throw new Error('Missing required parameters for recordMetric');
        }

        console.log('Recording metric on blockchain:', { metricId, value, businessId });
        // Record metric on blockchain
        const op = await contract.methods.recordMetric(
          metricId,
          value.toString(),
          businessId
        ).send();

        console.log('Waiting for Tezos operation confirmation...');
        const confirmation = await op.confirmation(1);
        
        const operationHash = op.hash;
        const blockLevel = confirmation.block.header.level;

        // Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase configuration missing');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Update the metric with Tezos transaction details
        const { error: updateError } = await supabase
          .from('widget_metrics')
          .update({
            tezos_operation_hash: operationHash,
            tezos_block_level: blockLevel,
            tezos_contract_address: targetContract
          })
          .eq('id', metricId);

        if (updateError) {
          console.error('Error updating metric:', updateError);
          throw updateError;
        }

        console.log('Successfully recorded metric on blockchain:', {
          operationHash,
          blockLevel,
          contractAddress: targetContract
        });

        result = {
          operationHash,
          blockLevel,
          contractAddress: targetContract
        };
        break;

      default:
        throw new Error('Invalid action specified');
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in verify-tezos-metric:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
