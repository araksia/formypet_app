import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to get recurring interval in milliseconds
function getRecurringInterval(recurringType: string): number {
  switch (recurringType) {
    case 'daily':
      return 24 * 60 * 60 * 1000; // 1 day
    case 'weekly':
      return 7 * 24 * 60 * 60 * 1000; // 1 week
    case 'monthly':
      return 30 * 24 * 60 * 60 * 1000; // 30 days (approximate)
    case '6months':
      return 6 * 30 * 24 * 60 * 60 * 1000; // 6 months (approximate)
    case 'yearly':
      return 365 * 24 * 60 * 60 * 1000; // 1 year (approximate)
    default:
      return 0;
  }
}

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
    // We need to combine event_date and event_time to get the full timestamp
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()) // Events from last 24 hours
      .lte('event_date', new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()); // Events in next 24 hours

    if (eventsError) {
      throw new Error(`Failed to fetch events: ${eventsError.message}`);
    }

    console.log(`Found ${events?.length || 0} potential events to process`);

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No events to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter events that need notifications in the next 5 minutes
    const eventsToNotify = events.filter(event => {
      // Since event_date is now timestamp without time zone and contains full datetime,
      // we just use it directly - no need to combine with event_time
      const fullEventTime = new Date(event.event_date);
      
      // Check if notification should be sent (5 minutes before event)
      const notificationTime = new Date(fullEventTime.getTime() - 5 * 60 * 1000);
      
      console.log(`Event "${event.title}": full time ${fullEventTime.toISOString()}, notification time ${notificationTime.toISOString()}, current time ${now.toISOString()}`);
      
      return notificationTime <= now && now < fullEventTime && fullEventTime > now;
    });

    console.log(`Found ${eventsToNotify.length} events that need notifications now`);

    // Process recurring events - create next instances for events that have passed
    for (const event of events) {
      if (event.recurring && event.recurring !== 'none') {
        // Since event_date is now timestamp without time zone and contains full datetime,
        // we just use it directly
        const fullEventTime = new Date(event.event_date);
        
        // If this recurring event has passed, create the next instance
        if (fullEventTime < now) {
          console.log(`Creating next instance for recurring event: ${event.title}`);
          
          try {
            const { data: nextEventId, error: nextEventError } = await supabase.rpc(
              'create_recurring_event_instance', 
              {
                original_event_id: event.id,
                next_occurrence: new Date(fullEventTime.getTime() + getRecurringInterval(event.recurring)).toISOString()
              }
            );
            
            if (nextEventError) {
              console.error(`Failed to create next instance for event ${event.id}:`, nextEventError);
            } else {
              console.log(`Created next instance ${nextEventId} for recurring event ${event.id}`);
            }
          } catch (error) {
            console.error(`Error creating next instance for event ${event.id}:`, error);
          }
        }
      }
    }

    if (eventsToNotify.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No events need notifications at this time' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send notifications for each event
    const results = [];
    for (const event of eventsToNotify) {
      try {
        console.log(`Processing event: ${event.title} (ID: ${event.id})`);
        
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