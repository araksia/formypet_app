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

        // For recurring events, create next occurrence and mark current as sent
        if (event.recurring && event.recurring !== 'none') {
          // Calculate next occurrence
          const currentEventDate = new Date(event.event_date);
          let nextDate = new Date(currentEventDate);
          
          switch (event.recurring) {
            case 'daily':
              nextDate.setDate(nextDate.getDate() + 1);
              break;
            case 'weekly':
              nextDate.setDate(nextDate.getDate() + 7);
              break;
            case 'monthly':
              nextDate.setMonth(nextDate.getMonth() + 1);
              break;
            case '6months':
              nextDate.setMonth(nextDate.getMonth() + 6);
              break;
            case 'yearly':
              nextDate.setFullYear(nextDate.getFullYear() + 1);
              break;
          }
          
          // Format next date properly
          const nextYear = nextDate.getFullYear();
          const nextMonth = (nextDate.getMonth() + 1).toString().padStart(2, '0');
          const nextDay = nextDate.getDate().toString().padStart(2, '0');
          const nextHours = nextDate.getHours().toString().padStart(2, '0');
          const nextMinutes = nextDate.getMinutes().toString().padStart(2, '0');
          
          const nextEventDateLocal = `${nextYear}-${nextMonth}-${nextDay} ${nextHours}:${nextMinutes}:00`;
          
          // Create next occurrence
          const { error: createError } = await supabase
            .from('events')
            .insert({
              title: event.title,
              event_type: event.event_type,
              pet_id: event.pet_id,
              user_id: event.user_id,
              event_date: nextEventDateLocal,
              event_time: event.event_time,
              recurring: event.recurring,
              notes: event.notes,
              notification_sent: false
            });
            
          if (createError) {
            console.error('Error creating next recurring event:', createError);
          } else {
            console.log(`Created next occurrence for ${event.title} on ${nextEventDateLocal}`);
          }
        }
        
        // Mark current notification as sent
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