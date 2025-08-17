import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Simple test function running!');
    const now = new Date();
    console.log(`Current UTC time: ${now.toISOString()}`);
    
    const greekTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    console.log(`Current Greek time: ${greekTime.toISOString()}`);

    return new Response(
      JSON.stringify({ 
        message: 'Test function works!',
        utcTime: now.toISOString(),
        greekTime: greekTime.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in test function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});