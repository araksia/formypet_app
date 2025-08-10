import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    console.log('Checking scheduled events...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current time and time 5 minutes from now
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    
    console.log(`Checking events between ${now.toISOString()} and ${fiveMinutesFromNow.toISOString()}`);

    // Find events that should trigger notifications in the next 5 minutes
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        *,
        pets(name)
      `)
      .gte('event_date', now.toISOString())
      .lte('event_date', fiveMinutesFromNow.toISOString());

    if (eventsError) {
      throw new Error(`Failed to fetch events: ${eventsError.message}`);
    }

    console.log(`Found ${events?.length || 0} events to process`);

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No events to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send notifications for each event
    const results = [];
    for (const event of events) {
      try {
        console.log(`Processing event: ${event.title} for ${event.pets?.name}`);
        
        // Call the send-push-notification function
        const response = await supabase.functions.invoke('send-push-notification', {
          body: {
            action: 'send_event_notification',
            eventId: event.id
          }
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        results.push({
          eventId: event.id,
          title: event.title,
          success: true,
          result: response.data
        });

      } catch (error) {
        console.error(`Failed to send notification for event ${event.id}:`, error);
        results.push({
          eventId: event.id,
          title: event.title,
          success: false,
          error: error.message
        });
      }
    }

    console.log('Scheduled events check completed:', results);

    return new Response(
      JSON.stringify({ 
        message: 'Scheduled events processed',
        processedEvents: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-scheduled-events function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});