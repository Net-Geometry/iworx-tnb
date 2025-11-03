import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    console.log('[IoT Webhook Test] Received request');
    
    // Parse the incoming payload
    const payload = await req.json();
    console.log('[IoT Webhook Test] Raw payload:', JSON.stringify(payload, null, 2));

    // Extract common fields (flexible - accept any structure)
    const deviceIdentifier = payload.device_id || payload.deviceId || payload.dev_eui || payload.device || 'unknown';
    const timestamp = payload.timestamp || payload.time || new Date().toISOString();
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store the raw payload in test table
    const { data: insertedData, error: insertError } = await supabase
      .from('iot_webhook_test_data')
      .insert({
        device_identifier: deviceIdentifier,
        raw_payload: payload,
        received_at: new Date().toISOString(),
        processed: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[IoT Webhook Test] Database error:', insertError);
      throw insertError;
    }

    const processingTime = Date.now() - startTime;
    console.log(`[IoT Webhook Test] Successfully stored data in ${processingTime}ms`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Data received successfully',
        received_at: new Date().toISOString(),
        device_id: deviceIdentifier,
        processing_time_ms: processingTime,
        record_id: insertedData.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[IoT Webhook Test] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
