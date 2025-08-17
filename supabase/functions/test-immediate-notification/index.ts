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

    // Send FCM notification using V1 API
    const projectId = Deno.env.get('FIREBASE_PROJECT_ID');
    if (!projectId) {
      throw new Error('FIREBASE_PROJECT_ID not configured');
    }

    const accessToken = await getAccessToken();

    const message = {
      message: {
        token: tokens[0].token,
        notification: {
          title: 'Test Ειδοποίηση',
          body: 'Αυτό είναι ένα test push notification με το νέο V1 API!',
        },
        data: {
          type: 'test_immediate'
        },
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

    console.log('TEST IMMEDIATE: Sending FCM V1 notification...');

    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
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