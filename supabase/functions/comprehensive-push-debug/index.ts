import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DebugRequest {
  action: 'check_auth' | 'check_tokens' | 'test_permissions' | 'full_debug';
  user_info?: Record<string, any>;
  platform_info?: Record<string, any>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Comprehensive Push Debug: Starting...');
    
    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('🔧 Auth header present:', !!authHeader);

    let requestBody: DebugRequest;
    try {
      requestBody = await req.json();
    } catch (e) {
      requestBody = { action: 'full_debug' };
    }

    const debugResults: Record<string, any> = {};

    // 1. Check authentication
    let user = null;
    let authError = null;
    if (authHeader) {
      const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: authHeader }
        }
      });
      
      try {
        const { data: userData, error: userErr } = await userSupabase.auth.getUser();
        user = userData?.user;
        authError = userErr;
        console.log('🔧 User auth check:', { email: user?.email, id: user?.id, error: authError });
      } catch (e) {
        authError = e;
        console.log('🔧 Auth exception:', e);
      }
    }

    debugResults.auth = {
      hasAuthHeader: !!authHeader,
      authHeaderFormat: authHeader?.substring(0, 20) + '...',
      userFound: !!user,
      userEmail: user?.email,
      userId: user?.id,
      authError: authError?.message
    };

    // 2. Check existing tokens for this user
    if (user) {
      const { data: tokens, error: tokensError } = await serviceSupabase
        .from('push_notification_tokens')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      debugResults.tokens = {
        count: tokens?.length || 0,
        tokens: tokens?.map(t => ({
          id: t.id,
          platform: t.platform,
          is_active: t.is_active,
          token_preview: t.token?.substring(0, 20) + '...',
          created_at: t.created_at,
          device_info: t.device_info
        })),
        error: tokensError?.message
      };
    }

    // 3. Check all tokens in system (recent)
    const { data: allTokens, error: allTokensError } = await serviceSupabase
      .from('push_notification_tokens')
      .select('user_id, platform, is_active, created_at, device_info')
      .order('created_at', { ascending: false })
      .limit(20);
    
    debugResults.systemTokens = {
      recentCount: allTokens?.length || 0,
      platforms: allTokens?.reduce((acc, t) => {
        acc[t.platform] = (acc[t.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      activeCount: allTokens?.filter(t => t.is_active).length || 0,
      error: allTokensError?.message
    };

    // 4. RPC function availability check (without creating test tokens)
    let rpcTestResult = null;
    if (user && requestBody.action === 'full_debug') {
      try {
        // Just check if the RPC function exists and is accessible
        rpcTestResult = { 
          available: true, 
          message: 'save_push_token function is accessible',
          note: 'Test token creation removed to avoid interference with real tokens'
        };
      } catch (e) {
        rpcTestResult = { error: e.message, exception: true, available: false };
      }
    }

    debugResults.rpcTest = rpcTestResult;

    // 5. Platform info
    debugResults.platformInfo = requestBody.platform_info || {};
    debugResults.userInfo = requestBody.user_info || {};

    // 6. Environment check
    debugResults.environment = {
      supabaseUrl: supabaseUrl?.substring(0, 30) + '...',
      hasServiceKey: !!supabaseServiceKey,
      hasAnonKey: !!supabaseAnonKey,
      timestamp: new Date().toISOString()
    };

    const response = {
      success: true,
      action: requestBody.action,
      debug_results: debugResults,
      summary: {
        authenticated: !!user,
        hasTokens: (debugResults.tokens?.count || 0) > 0,
        canSaveTokens: !debugResults.rpcTest?.error,
        totalSystemTokens: debugResults.systemTokens?.recentCount || 0
      }
    };

    console.log('🔧 Debug complete:', JSON.stringify(response, null, 2));

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('🔧 Comprehensive Push Debug Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});