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
    console.log('🧪 Manual notification test starting...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test specific event
    const eventId = '2cbb421a-b211-4e6a-8df9-49f4db197ac3';
    
    console.log('🎯 Testing notification for event:', eventId);

    // Call send-push-notification function
    const { data: notificationResult, error: notificationError } = await supabase.functions.invoke('send-push-notification', {
      body: {
        action: 'send_event_notification',
        event_id: eventId
      }
    });

    console.log('📤 Notification result:', notificationResult);
    
    if (notificationError) {
      console.error('❌ Notification error:', notificationError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        eventId,
        notificationResult,
        notificationError: notificationError?.message || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Test error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});