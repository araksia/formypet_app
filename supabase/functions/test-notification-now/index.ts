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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('TEST NOW: Starting immediate notification test...');

    // Step 1: Pick the "Askisi" event that hasn't been sent
    const eventId = '560be3b1-4c63-4d64-8d35-f72a69bbd2f0';

    // Step 2: Force send notification for this event
    const { data: notificationResult, error: notificationError } = await supabase.functions.invoke('send-push-notification', {
      body: {
        action: 'send_event_notification',
        eventId: eventId
      }
    });

    console.log('TEST NOW: Notification result:', { notificationResult, notificationError });

    // Step 3: Mark it as sent
    if (!notificationError) {
      const { error: updateError } = await supabase
        .from('events')
        .update({ notification_sent: true })
        .eq('id', eventId);

      console.log('TEST NOW: Update result:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Immediate notification test completed',
        notificationResult,
        notificationError: notificationError?.message || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('TEST NOW: Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});