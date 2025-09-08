import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Testing complete notification system...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Call check-scheduled-events
    console.log('📅 Step 1: Checking scheduled events...');
    const { data: checkResult, error: checkError } = await supabase.functions.invoke('check-scheduled-events', {
      body: {}
    });

    console.log('✅ Check result:', checkResult);
    if (checkError) {
      console.error('❌ Check error:', checkError);
    }

    // Step 2: Try to send a manual notification for the test event
    console.log('📤 Step 2: Testing manual notification...');
    const { data: manualResult, error: manualError } = await supabase.functions.invoke('send-push-notification', {
      body: {
        action: 'send_event_notification',
        event_id: '2cbb421a-b211-4e6a-8df9-49f4db197ac3'
      }
    });

    console.log('✅ Manual result:', manualResult);
    if (manualError) {
      console.error('❌ Manual error:', manualError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        checkResult,
        checkError: checkError?.message || null,
        manualResult,
        manualError: manualError?.message || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 System test error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});