import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Test Firebase configuration and token
async function testFirebaseConfig() {
  console.log('🔥 Testing Firebase configuration...');
  
  const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_KEY');
  
  if (!serviceAccountJson) {
    return { success: false, error: 'FIREBASE_SERVICE_ACCOUNT_KEY not found' };
  }
  
  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    const { private_key, client_email, project_id } = serviceAccount;
    
    return {
      success: true,
      config: {
        hasPrivateKey: !!private_key,
        hasClientEmail: !!client_email,
        hasProjectId: !!project_id,
        projectId: project_id,
        clientEmail: client_email?.substring(0, 20) + '...'
      }
    };
  } catch (error) {
    return { success: false, error: 'Invalid JSON in FIREBASE_SERVICE_ACCOUNT_KEY: ' + error.message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔥 TEST FIREBASE CONFIG: Starting...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test Firebase configuration
    const firebaseTest = await testFirebaseConfig();
    
    // Get active push tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('push_notification_tokens')
      .select('*')
      .eq('is_active', true)
      .limit(5);

    console.log('🔥 Firebase config:', firebaseTest);
    console.log('🔥 Active tokens:', tokens?.length || 0);

    // Try to send test notification if we have tokens and Firebase is configured
    let notificationResult = null;
    if (firebaseTest.success && tokens && tokens.length > 0) {
      console.log('🔥 Attempting test notification...');
      
      const { data: pushResult, error: pushError } = await supabase.functions.invoke('send-push-notification', {
        body: {
          action: 'send_notification',
          token: tokens[0].token,
          title: 'Firebase Test ✅',
          body: 'Το Firebase configuration λειτουργεί σωστά! 🔥'
        }
      });

      notificationResult = { pushResult, pushError: pushError?.message || null };
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        firebase: firebaseTest,
        tokens: {
          count: tokens?.length || 0,
          tokens: tokens?.map(t => ({
            platform: t.platform,
            is_active: t.is_active,
            token_preview: t.token.substring(0, 20) + '...',
            created_at: t.created_at
          })) || []
        },
        notification: notificationResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('🔥 TEST FIREBASE CONFIG: Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});