import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate OAuth2 token using service account key
async function getAccessToken() {
  const serviceAccountKey = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_KEY');
  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY not configured');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    
    // Create JWT using crypto.subtle
    const encoder = new TextEncoder();
    
    // Create header and payload
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };
    
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };
    
    // Base64url encode
    const base64urlEncode = (obj: any) => {
      return btoa(JSON.stringify(obj))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    };
    
    const headerEncoded = base64urlEncode(header);
    const payloadEncoded = base64urlEncode(payload);
    const unsignedToken = `${headerEncoded}.${payloadEncoded}`;
    
    // Import private key
    const privateKeyPem = serviceAccount.private_key;
    const privateKeyDer = privateKeyPem
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '');
    
    const privateKeyBuffer = Uint8Array.from(atob(privateKeyDer), c => c.charCodeAt(0));
    
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256'
      },
      false,
      ['sign']
    );
    
    // Sign the token
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      encoder.encode(unsignedToken)
    );
    
    const signatureBase64url = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    const jwt = `${unsignedToken}.${signatureBase64url}`;
    
    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });
    
    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token response error:', error);
      throw new Error(`Failed to get access token: ${error}`);
    }
    
    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

// FCM notification sender using V1 API
async function sendFCMNotification(token: string, title: string, body: string, data?: any) {
  const projectId = Deno.env.get('FIREBASE_PROJECT_ID');
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID not configured');
  }

  const accessToken = await getAccessToken();

  const message = {
    message: {
      token: token,
      notification: {
        title: title,
        body: body
      },
      data: data || {},
      android: {
        notification: {
          sound: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default'
          }
        }
      }
    }
  };

  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FCM V1 Error: ${response.status} - ${errorText}`);
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

      // Get push tokens for the user (only the most recent one)
      const { data: tokens, error: tokensError } = await supabase
        .from('push_notification_tokens')
        .select('*')
        .eq('user_id', event.user_id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (tokensError || !tokens || tokens.length === 0) {
        console.log('PUSH NOTIFICATION: No active tokens found for user:', event.user_id);
        throw new Error('No active push tokens found for user');
      }

      console.log('PUSH NOTIFICATION: Using most recent token for user:', event.user_id);

      // Send notification to only the most recent token
      try {
        const fcmResult = await sendFCMNotification(
          tokens[0].token,
          `⏰ ${event.title}`,
          event.notes || 'Υπενθύμιση για το κατοικίδιό σας! 🐾',
          {
            eventId: event.id,
            eventType: event.event_type,
            petId: event.pet_id,
            type: 'event_reminder'
          }
        );

        console.log('PUSH NOTIFICATION: Successfully sent to token');
        
        // Mark event as notification sent
        await supabase
          .from('events')
          .update({ notification_sent: true, updated_at: new Date().toISOString() })
          .eq('id', eventId);

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Event notification sent successfully',
            result: fcmResult
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (error: any) {
        console.error('PUSH NOTIFICATION: FCM Error:', error.message);
        
        // Check if it's a token-related error and deactivate the token
        if (error.message.includes('NOT_FOUND') || 
            error.message.includes('INVALID_ARGUMENT') || 
            error.message.includes('UNREGISTERED') ||
            error.message.includes('TOO_MANY_REGISTRATIONS')) {
          
          console.log('PUSH NOTIFICATION: Deactivating invalid/problematic token');
          await supabase
            .from('push_notification_tokens')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('token', tokens[0].token);
        }
        
        throw error;
      }

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
      // Save/update push token with improved deduplication
      const userId = data?.userId;
      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log('PUSH NOTIFICATION: Saving token for user:', userId);
      
      // First, deactivate ALL existing tokens for this user
      await supabase
        .from('push_notification_tokens')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      // Then save the new token
      const { data: savedToken, error: saveError } = await supabase
        .from('push_notification_tokens')
        .upsert({
          user_id: userId,
          token: token,
          platform: data?.platform || 'mobile',
          device_info: data?.deviceInfo || {},
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (saveError) {
        console.error('PUSH NOTIFICATION: Error saving token:', saveError);
        throw saveError;
      }

      console.log('PUSH NOTIFICATION: Token saved successfully:', savedToken.id);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Token saved successfully',
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