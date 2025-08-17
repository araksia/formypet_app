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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Reset notification_sent for future events only
    const { data: resetEvents, error } = await supabase
      .from('events')
      .update({ notification_sent: false })
      .gt('event_time', '22:00')
      .select('id, title, event_time, notification_sent');

    if (error) {
      throw error;
    }

    console.log('Reset notifications for events:', resetEvents);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Notifications reset',
        resetEvents: resetEvents?.length || 0,
        events: resetEvents
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error resetting notifications:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});