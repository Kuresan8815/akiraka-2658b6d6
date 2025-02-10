
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { TezosToolkit } from 'https://esm.sh/@taquito/taquito';
import { InMemorySigner } from 'https://esm.sh/@taquito/signer';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { metricId, value, businessId } = await req.json();
    console.log('Processing Tezos verification for metric:', { metricId, value, businessId });

    // Initialize Tezos client
    const Tezos = new TezosToolkit(Deno.env.get('TEZOS_RPC_URL') || '');
    const signer = await InMemorySigner.fromSecretKey(Deno.env.get('TEZOS_PRIVATE_KEY') || '');
    Tezos.setProvider({ signer });

    const contractAddress = Deno.env.get('TEZOS_CONTRACT_ADDRESS');
    if (!contractAddress) {
      throw new Error('Tezos contract address not configured');
    }

    // Get the contract instance
    const contract = await Tezos.wallet.at(contractAddress);
    console.log('Connected to Tezos contract:', contractAddress);

    // Call the smart contract to record the metric
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
        tezos_contract_address: contractAddress
      })
      .eq('id', metricId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        operationHash,
        blockLevel,
        contractAddress
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
