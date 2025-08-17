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
    console.log('TEST IMMEDIATE: Starting test notification...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('TEST IMMEDIATE: Supabase client created');

    // Get the most recent active token
    const { data: tokens, error: tokensError } = await supabase
      .from('push_notification_tokens')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (tokensError || !tokens || tokens.length === 0) {
      throw new Error(`No active tokens found: ${tokensError?.message}`);
    }

    console.log('TEST IMMEDIATE: Found token:', tokens[0].token.substring(0, 20) + '...');

    // Send FCM notification directly
    const serverKey = Deno.env.get('FIREBASE_SERVER_KEY');
    if (!serverKey) {
      throw new Error('FIREBASE_SERVER_KEY not configured');
    }

    const payload = {
      to: tokens[0].token,
      notification: {
        title: 'Test Ειδοποίηση',
        body: 'Αυτό είναι ένα test push notification άμεσα από τη βάση!',
        sound: 'default'
      },
      data: {
        type: 'test_immediate'
      }
    };

    console.log('TEST IMMEDIATE: Sending FCM notification...');

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${serverKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('TEST IMMEDIATE: FCM Response status:', response.status);

    const notificationResult = await response.json();
    console.log('TEST IMMEDIATE: FCM Response body:', notificationResult);

    if (!response.ok) {
      throw new Error(`FCM Error: ${response.status} - ${JSON.stringify(notificationResult)}`);
    }

    console.log('TEST IMMEDIATE: Notification result:', notificationResult);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Test notification sent',
        tokenUsed: tokens[0].token.substring(0, 20) + '...',
        notificationResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('TEST IMMEDIATE: Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});