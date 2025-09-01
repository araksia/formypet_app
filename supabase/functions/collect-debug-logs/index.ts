import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 ForMyPet Debug: collect-debug-logs function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { level, message, component, metadata } = await req.json();
    
    console.log(`📝 ForMyPet Debug: Received log - Level: ${level}, Component: ${component}, Message: ${message}`);

    // Get user agent from request headers
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const referer = req.headers.get('referer') || req.headers.get('origin') || 'unknown';

    const { data, error } = await supabase
      .from('debug_logs')
      .insert({
        level: level || 'info',
        message: message || 'No message',
        component: component || 'unknown',
        user_agent: userAgent,
        url: referer,
        metadata: metadata || {}
      });

    if (error) {
      console.error('💥 ForMyPet Debug: Error inserting log:', error);
      throw error;
    }

    console.log('✅ ForMyPet Debug: Log inserted successfully');
    
    return new Response(
      JSON.stringify({ success: true, message: 'Log recorded successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('💥 ForMyPet Debug: Function error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});