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
    
    // Convert to Greek time (UTC+3 for summer time)
    const greekTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    console.log(`Greek time: ${greekTime.toISOString()}`);

    // Get events that need notifications (5 minutes before event time)
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('notification_sent', false)
      .gte('event_date', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
      .lte('event_date', new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString());

    if (eventsError) {
      throw new Error(`Failed to fetch events: ${eventsError.message}`);
    }

    console.log(`Found ${events?.length || 0} events to check`);

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No events to check' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const eventsToNotify = [];
    
    for (const event of events) {
      if (event.event_time) {
        // Combine date and time
        const eventDateStr = event.event_date.split('T')[0];
        const eventTimeStr = event.event_time;
        const fullEventTime = new Date(`${eventDateStr}T${eventTimeStr}`);
        
        // Calculate notification time (5 minutes before event)
        const notificationTime = new Date(fullEventTime.getTime() - 5 * 60 * 1000);
        
        console.log(`Event "${event.title}": event at ${fullEventTime.toISOString()}, notification at ${notificationTime.toISOString()}, now ${greekTime.toISOString()}`);
        
        // If current time is past notification time and before event time
        if (greekTime >= notificationTime && greekTime <= fullEventTime) {
          eventsToNotify.push(event);
        }
      }
    }

    console.log(`Found ${eventsToNotify.length} events that need notifications now`);

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
        console.log(`Sending notification for event: ${event.title}`);
        
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

        // Mark notification as sent
        await supabase
          .from('events')
          .update({ notification_sent: true })
          .eq('id', event.id);

        results.push({
          eventId: event.id,
          title: event.title,
          success: true
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

    console.log('Notifications sent:', results);

    return new Response(
      JSON.stringify({ 
        message: 'Notifications processed',
        processedEvents: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-scheduled-events:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});