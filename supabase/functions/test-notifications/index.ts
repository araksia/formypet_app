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
    console.log('TEST: Function starting...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('TEST: Supabase client created');

    // Try to update past events
    const { data: updatedEvents, error } = await supabase
      .from('events')
      .update({ notification_sent: true })
      .eq('notification_sent', false)
      .lt('event_time', '23:30')
      .select('id, title, event_time');

    console.log('TEST: Update completed', { updatedEvents, error });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Function executed successfully',
        updatedEvents: updatedEvents?.length || 0,
        events: updatedEvents
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('TEST: Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});