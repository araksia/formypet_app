import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple FCM notification sender
async function sendFCMNotification(token: string, title: string, body: string) {
  const serverKey = Deno.env.get('FIREBASE_SERVER_KEY');
  if (!serverKey) {
    throw new Error('FIREBASE_SERVER_KEY not configured');
  }

  const payload = {
    to: token,
    notification: {
      title: title,
      body: body,
      sound: 'default'
    },
    data: {
      type: 'event_reminder'
    }
  };

  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': `key=${serverKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FCM Error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('FORCE NOTIFICATION: Starting...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get active push token
    const { data: tokens, error: tokensError } = await supabase
      .from('push_notification_tokens')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (tokensError || !tokens || tokens.length === 0) {
      throw new Error('No active push tokens found');
    }

    const token = tokens[0].token;
    console.log('FORCE NOTIFICATION: Found token, length:', token.length);

    // Check Firebase server key
    const serverKey = Deno.env.get('FIREBASE_SERVER_KEY');
    console.log('FORCE NOTIFICATION: Server key exists:', !!serverKey);

    // Send test notification
    const result = await sendFCMNotification(
      token,
      'Test Ειδοποίηση', 
      'Αυτό είναι ένα test από το force notification function!'
    );

    console.log('FORCE NOTIFICATION: FCM result:', result);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Notification sent successfully',
        fcmResult: result,
        tokenUsed: token.substring(0, 20) + '...'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('FORCE NOTIFICATION: Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});