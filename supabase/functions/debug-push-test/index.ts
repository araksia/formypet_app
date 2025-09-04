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
    console.log('🔍 Starting push notification debug test...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check environment variables
    const firebaseProjectId = Deno.env.get('FIREBASE_PROJECT_ID');
    const firebaseServiceKey = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_KEY');
    
    console.log('🔍 Environment check:');
    console.log('- Firebase Project ID exists:', !!firebaseProjectId);
    console.log('- Firebase Service Key exists:', !!firebaseServiceKey);
    console.log('- Supabase URL exists:', !!supabaseUrl);
    console.log('- Supabase Key exists:', !!supabaseKey);
    
    if (firebaseProjectId) {
      console.log('- Firebase Project ID:', firebaseProjectId);
    }
    
    // Get active push tokens
    const { data: tokens, error: tokenError } = await supabase
      .from('push_notification_tokens')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);
      
    console.log('🔍 Token query result:', { 
      tokensCount: tokens?.length || 0, 
      error: tokenError?.message || 'none'
    });
    
    if (tokens && tokens.length > 0) {
      console.log('🔍 First token details:', {
        userId: tokens[0].user_id,
        platform: tokens[0].platform,
        tokenPrefix: tokens[0].token.substring(0, 30) + '...',
        createdAt: tokens[0].created_at
      });
    }
    
    // Test direct notification call
    if (!firebaseProjectId || !firebaseServiceKey) {
      console.log('🔍 Missing Firebase credentials, cannot send notification');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Missing Firebase credentials',
          details: {
            firebaseProjectId: !!firebaseProjectId,
            firebaseServiceKey: !!firebaseServiceKey,
            tokensFound: tokens?.length || 0
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'No active push tokens found',
          details: {
            firebaseConfigured: true,
            tokensFound: 0
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Try to call send-push-notification function
    console.log('🔍 Calling send-push-notification function...');
    
    const { data: result, error: functionError } = await supabase.functions.invoke('send-push-notification', {
      body: {
        action: 'send_notification',
        title: '🔍 Debug Test',
        body: 'Test notification from debug function',
        token: tokens[0].token
      }
    });
    
    console.log('🔍 Function call result:', { 
      result, 
      error: functionError?.message || 'none'
    });
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Debug test completed',
        details: {
          firebaseConfigured: true,
          tokensFound: tokens.length,
          firstTokenUser: tokens[0].user_id,
          functionResult: result,
          functionError: functionError?.message || null
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('🔍 Debug test error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});