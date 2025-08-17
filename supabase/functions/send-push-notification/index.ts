import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple FCM notification sender using legacy API
async function sendFCMNotification(token: string, title: string, body: string, data?: any) {
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
    data: data || {}
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
    const { action, eventId, token, title, body, data } = await req.json();

    console.log('PUSH NOTIFICATION: Action:', action);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === 'send_event_notification') {
      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        throw new Error(`Event not found: ${eventError?.message}`);
      }

      console.log('PUSH NOTIFICATION: Event found:', event.title);

      // Get push tokens for the user
      const { data: tokens, error: tokensError } = await supabase
        .from('push_notification_tokens')
        .select('*')
        .eq('user_id', event.user_id)
        .eq('is_active', true);

      if (tokensError || !tokens || tokens.length === 0) {
        throw new Error('No active push tokens found for user');
      }

      console.log('PUSH NOTIFICATION: Found tokens:', tokens.length);

      const results = [];
      for (const tokenData of tokens) {
        try {
          const fcmResult = await sendFCMNotification(
            tokenData.token,
            `Υπενθύμιση: ${event.title}`,
            `Το event "${event.title}" θα ξεκινήσει σε 5 λεπτά!`,
            {
              eventId: event.id,
              type: 'event_reminder'
            }
          );

          results.push({
            token: tokenData.token.substring(0, 20) + '...',
            success: true,
            result: fcmResult
          });

          console.log('PUSH NOTIFICATION: Sent successfully to token');
        } catch (error) {
          console.error('PUSH NOTIFICATION: Failed for token:', error.message);
          results.push({
            token: tokenData.token.substring(0, 20) + '...',
            success: false,
            error: error.message
          });
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Event notifications processed',
          results 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'send_notification') {
      // Manual notification
      const fcmResult = await sendFCMNotification(token, title, body, data);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Notification sent',
          result: fcmResult
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'save_token') {
      // Save/update push token
      const { data: savedToken, error: saveError } = await supabase
        .from('push_notification_tokens')
        .upsert({
          user_id: data?.userId,
          token: token,
          platform: data?.platform || 'mobile',
          device_info: data?.deviceInfo || {},
          is_active: true
        })
        .select()
        .single();

      if (saveError) {
        throw saveError;
      }

      // Deactivate other tokens for this user
      await supabase
        .from('push_notification_tokens')
        .update({ is_active: false })
        .neq('id', savedToken.id)
        .eq('user_id', data?.userId);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Token saved',
          tokenId: savedToken.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('PUSH NOTIFICATION: Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});