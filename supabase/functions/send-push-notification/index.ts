import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get Firebase Service Account Key from environment
const getFirebaseServiceAccount = () => {
  const serviceAccountKey = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_KEY');
  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY not found');
  }
  return JSON.parse(serviceAccountKey);
};

// Generate JWT for Firebase FCM v1 API
const generateJWT = async (serviceAccount: any) => {
  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const message = `${headerB64}.${payloadB64}`;
  
  // Import the private key - fix PEM format parsing
  let privateKeyPem = serviceAccount.private_key;
  
  // Replace escaped newlines and ensure proper PEM format
  privateKeyPem = privateKeyPem.replace(/\\n/g, '\n');
  
  // Extract the base64 content between the PEM headers
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  const startIndex = privateKeyPem.indexOf(pemHeader) + pemHeader.length;
  const endIndex = privateKeyPem.indexOf(pemFooter);
  
  if (startIndex === -1 + pemHeader.length || endIndex === -1) {
    throw new Error('Invalid PEM format for private key');
  }
  
  const base64Key = privateKeyPem.substring(startIndex, endIndex).replace(/\s/g, '');
  
  // Convert base64 to binary
  const binaryKey = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    encoder.encode(message)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${message}.${signatureB64}`;
};

// Get OAuth2 access token
const getAccessToken = async (serviceAccount: any) => {
  const jwt = await generateJWT(serviceAccount);
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await response.json();
  return data.access_token;
};

// Send FCM notification using v1 API
const sendFCMNotification = async (token: string, title: string, body: string, data?: any) => {
  const serviceAccount = getFirebaseServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  
  const message = {
    message: {
      token: token,
      notification: {
        title: title,
        body: body,
      },
      data: data || {},
      android: {
        priority: "high",
        notification: {
          default_sound: true,
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: title,
              body: body,
            },
            sound: "default",
            badge: 1,
          }
        }
      }
    }
  };

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    }
  );

  const result = await response.json();
  console.log('FCM Response:', result);
  
  if (!response.ok) {
    throw new Error(`FCM Error: ${result.error?.message || 'Unknown error'}`);
  }

  return result;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    if (action === 'send_event_notification') {
      const { eventId } = params;
      
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      console.log(`Looking for event with ID: ${eventId}`);

      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          pets(name)
        `)
        .eq('id', eventId)
        .maybeSingle();

      console.log(`Event query result:`, { event, eventError });

      if (eventError) {
        console.error('Event query error:', eventError);
        throw new Error(`Event query failed: ${eventError.message}`);
      }

      if (!event) {
        console.error('Event not found for ID:', eventId);
        throw new Error('Event not found');
      }

      // Get notification tokens for the user
      const { data: tokens, error: tokensError } = await supabase
        .from('push_notification_tokens')
        .select('token')
        .eq('user_id', event.user_id);

      if (tokensError) {
        throw new Error('Failed to get notification tokens');
      }

      if (!tokens || tokens.length === 0) {
        console.log('No notification tokens found for user');
        return new Response(
          JSON.stringify({ message: 'No notification tokens found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Send notifications to all user tokens
      const results = [];
      for (const tokenData of tokens) {
        try {
          const result = await sendFCMNotification(
            tokenData.token,
            `${event.title} - ${event.pets?.name}`,
            event.notes || `Ώρα για ${event.event_type}`,
            {
              eventId: event.id,
              petId: event.pet_id,
              eventType: event.event_type
            }
          );
          results.push({ token: tokenData.token, success: true, result });
        } catch (error) {
          console.error('Failed to send notification:', error);
          results.push({ token: tokenData.token, success: false, error: error.message });
        }
      }

      return new Response(
        JSON.stringify({ message: 'Notifications sent', results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Manual notification sending
    if (action === 'send_notification') {
      const { token, title, body, data } = params;
      
      const result = await sendFCMNotification(token, title, body, data);
      
      return new Response(
        JSON.stringify({ success: true, result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save push notification token
    if (action === 'save_token') {
      const { token, platform, user_id } = params;
      
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Save or update the token
      const { error } = await supabase.from('push_notification_tokens').upsert({
        user_id,
        token,
        platform,
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'token'
      });

      if (error) {
        console.error('Error saving token:', error);
        throw error;
      }

      // Deactivate other tokens for this user
      await supabase
        .from('push_notification_tokens')
        .update({ is_active: false })
        .eq('user_id', user_id)
        .neq('token', token);

      return new Response(
        JSON.stringify({ success: true, message: 'Token saved successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});