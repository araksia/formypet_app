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
    console.log('🧪 Starting direct push notification test...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🧪 Supabase client created');
    
    // Check Firebase secrets
    const firebaseProjectId = Deno.env.get('FIREBASE_PROJECT_ID');
    const firebaseServiceKey = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_KEY');
    
    console.log('🧪 Firebase Project ID exists:', !!firebaseProjectId);
    console.log('🧪 Firebase Service Key exists:', !!firebaseServiceKey);
    
    if (firebaseProjectId) {
      console.log('🧪 Firebase Project ID:', firebaseProjectId);
    }
    
    // Get an active push token
    const { data: tokens, error: tokenError } = await supabase
      .from('push_notification_tokens')
      .select('*')
      .eq('is_active', true)
      .limit(1);
      
    console.log('🧪 Token query result:', { tokens: tokens?.length, error: tokenError });
    
    if (tokenError) {
      throw new Error(`Token error: ${tokenError.message}`);
    }
    
    if (!tokens || tokens.length === 0) {
      throw new Error('No active push tokens found');
    }
    
    const token = tokens[0];
    console.log('🧪 Using token for user:', token.user_id);
    console.log('🧪 Token prefix:', token.token.substring(0, 20) + '...');
    
    // Try to call the send-push-notification function
    console.log('🧪 Calling send-push-notification function...');
    
    const { data: result, error: functionError } = await supabase.functions.invoke('send-push-notification', {
      body: {
        action: 'send_notification',
        title: '🧪 Direct Test',
        body: 'Αυτό είναι ένα direct test από το iPhone!',
        token: token.token
      }
    });
    
    console.log('🧪 Function call result:', { result, error: functionError });
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Direct push test completed',
        firebaseConfigured: !!firebaseProjectId && !!firebaseServiceKey,
        tokenFound: true,
        tokenUser: token.user_id,
        functionResult: result,
        functionError: functionError
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('🧪 Test error:', error);
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