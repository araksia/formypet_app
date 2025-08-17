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
    console.log('Checking scheduled events...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    console.log(`Current time: ${now.toISOString()}`);
    
    // Mark all past events as notified (simple fix for now)
    const { data: pastEvents, error: updateError } = await supabase
      .from('events')
      .update({ notification_sent: true })
      .lt('event_time', '23:30')
      .eq('notification_sent', false)
      .select();

    console.log(`Marked ${pastEvents?.length || 0} past events as notified`);

    return new Response(
      JSON.stringify({ 
        message: 'Past events marked as notified',
        markedEvents: pastEvents?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});