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
    console.log('🔄 Setting up notification scheduler...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create or update a scheduler table to track notification checks
    const { data: schedulerCheck, error: schedulerError } = await supabase
      .from('notification_scheduler')
      .select('*')
      .single();

    if (schedulerError && schedulerError.code === 'PGRST116') {
      // Table doesn't exist, we need to create it via migration
      console.log('📝 Notification scheduler table needs to be created');
    }

    // For now, let's manually trigger the notification check
    console.log('🚀 Manually triggering notification check...');
    
    const { data: triggerResult, error: triggerError } = await supabase.functions.invoke('check-scheduled-events', {
      body: {}
    });

    console.log('✅ Trigger result:', triggerResult);
    
    if (triggerError) {
      console.error('❌ Trigger error:', triggerError);
    }

    // Check current events that should have triggered
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 8);
    console.log(`⏰ Current time: ${currentTime}`);

    const { data: dueEvents, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('notification_sent', false)
      .eq('event_date', now.toISOString().split('T')[0])
      .lt('event_time', currentTime);

    console.log('📋 Due events:', dueEvents);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Notification system triggered manually',
        triggerResult,
        triggerError: triggerError?.message || null,
        dueEvents: dueEvents || [],
        currentTime,
        recommendations: [
          'Το σύστημα notifications λειτουργεί αλλά χρειάζεται manual trigger',
          'Θα πρέπει να ρυθμίσεις external cron job ή scheduler',
          'Εναλλακτικά μπορείς να καλείς το check-scheduled-events function περιοδικά'
        ]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Scheduler setup error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});