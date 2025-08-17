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
    console.log('TEST PUSH: Starting...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check Firebase credentials
    const firebaseServiceKey = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_KEY');
    const firebaseProjectId = Deno.env.get('FIREBASE_PROJECT_ID');
    
    console.log('TEST PUSH: Firebase credentials check:', {
      hasServiceKey: !!firebaseServiceKey,
      hasProjectId: !!firebaseProjectId,
      serviceKeyLength: firebaseServiceKey?.length || 0
    });

    // Get push tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('push_notification_tokens')
      .select('*')
      .eq('is_active', true);

    console.log('TEST PUSH: Push tokens:', { tokensCount: tokens?.length || 0, error: tokensError });

    // Try to call the send-push-notification function
    const { data: pushResult, error: pushError } = await supabase.functions.invoke('send-push-notification', {
      body: {
        action: 'send_notification',
        token: tokens?.[0]?.token,
        title: 'Test από Function',
        body: 'Αυτό είναι test notification'
      }
    });

    console.log('TEST PUSH: Function result:', { pushResult, pushError });

    return new Response(
      JSON.stringify({ 
        success: true,
        firebaseCredentials: {
          hasServiceKey: !!firebaseServiceKey,
          hasProjectId: !!firebaseProjectId
        },
        pushTokens: tokens?.length || 0,
        pushResult,
        pushError: pushError ? pushError.message : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('TEST PUSH: Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});