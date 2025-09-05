import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TokenSaveRequest {
  token: string;
  platform?: string;
  device_info?: Record<string, any>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Debug Token Save: Starting...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('🔧 Auth header present:', !!authHeader);
    console.log('🔧 Auth header format:', authHeader?.substring(0, 20) + '...');

    // Try to get the user from the token
    let user = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      console.log('🔧 User data:', userData?.user?.email);
      console.log('🔧 User error:', userError);
      user = userData?.user;
    }

    // Check if request has body
    let requestBody: TokenSaveRequest | null = null;
    try {
      requestBody = await req.json();
      console.log('🔧 Request body received:', !!requestBody?.token);
    } catch (e) {
      console.log('🔧 No request body or invalid JSON');
    }

    // Try to check current tokens for this user
    let existingTokens = [];
    if (user) {
      const { data: tokens, error: tokensError } = await supabase
        .from('push_notification_tokens')
        .select('*')
        .eq('user_id', user.id);
      
      console.log('🔧 Existing tokens count:', tokens?.length || 0);
      console.log('🔧 Tokens error:', tokensError);
      existingTokens = tokens || [];
    }

    // Try to test the save_push_token function if we have a token
    let saveResult = null;
    if (user && requestBody?.token) {
      console.log('🔧 Attempting to save token...');
      
      // Create authenticated client for this user
      const userSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: {
          headers: {
            Authorization: authHeader!
          }
        }
      });

      const { data: saveData, error: saveError } = await userSupabase.rpc('save_push_token', {
        token_value: requestBody.token,
        platform_value: requestBody.platform || 'mobile',
        device_info_value: requestBody.device_info || {}
      });

      console.log('🔧 Save result:', saveData);
      console.log('🔧 Save error:', saveError);
      
      saveResult = { data: saveData, error: saveError };
    }

    const response = {
      success: true,
      debug_info: {
        authHeaderPresent: !!authHeader,
        userAuthenticated: !!user,
        userEmail: user?.email || null,
        userId: user?.id || null,
        requestHasToken: !!requestBody?.token,
        tokenLength: requestBody?.token?.length || 0,
        existingTokensCount: existingTokens.length,
        saveAttempted: !!saveResult,
        saveResult: saveResult
      }
    };

    console.log('🔧 Final response:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('🔧 Debug Token Save Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      debug_info: {
        errorType: error.constructor.name,
        errorMessage: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});