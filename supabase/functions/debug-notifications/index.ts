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
    console.log('DEBUG: Starting debug...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Check event that should trigger notification
    const testEventId = 'e0532fcf-dc4a-4c1e-8f19-8f24f80b95b6'; // Gshs event
    
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', testEventId)
      .single();

    console.log('DEBUG: Event details:', event);

    // Step 2: Check push tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('push_notification_tokens')
      .select('*')
      .eq('user_id', event?.user_id)
      .eq('is_active', true);

    console.log('DEBUG: Push tokens:', tokens);

    // Step 3: Try to send notification manually
    const { data: notificationResult, error: notificationError } = await supabase.functions.invoke('send-push-notification', {
      body: {
        action: 'send_event_notification',
        eventId: testEventId
      }
    });

    console.log('DEBUG: Notification result:', { notificationResult, notificationError });

    // Step 4: Check Firebase env vars
    const firebaseCheck = {
      hasServiceKey: !!Deno.env.get('FIREBASE_SERVICE_ACCOUNT_KEY'),
      hasProjectId: !!Deno.env.get('FIREBASE_PROJECT_ID'),
      hasPrivateKey: !!Deno.env.get('FIREBASE_PRIVATE_KEY'),
      hasServerKey: !!Deno.env.get('FIREBASE_SERVER_KEY')
    };

    console.log('DEBUG: Firebase env check:', firebaseCheck);

    return new Response(
      JSON.stringify({ 
        success: true,
        event,
        tokens: tokens?.length || 0,
        firebaseCheck,
        notificationResult,
        notificationError: notificationError?.message || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('DEBUG: Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});