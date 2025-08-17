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

    // Get first pet
    const { data: pets } = await supabase.from('pets').select('id').limit(1);
    const petId = pets?.[0]?.id;

    if (!petId) {
      throw new Error('No pets found');
    }

    // Create event for 3 minutes from now (so notification comes immediately)
    const now = new Date();
    const eventTime = new Date(now.getTime() + 3 * 60 * 1000); // 3 minutes from now
    
    const eventDateStr = eventTime.toISOString().split('T')[0];
    const eventTimeStr = eventTime.toTimeString().split(' ')[0];

    const { data: newEvent, error } = await supabase
      .from('events')
      .insert({
        user_id: '1ae214d5-d6af-4aa1-8bd2-cfb225c22309',
        pet_id: petId,
        event_type: 'reminder',
        title: 'ΤΕΣΤ - Προσεχή Ειδοποίηση',
        event_date: eventDateStr,
        event_time: eventTimeStr,
        notes: 'Test event που θα στείλει ειδοποίηση σε 2 λεπτά',
        notification_sent: false
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('Created future event:', newEvent);

    return new Response(
      JSON.stringify({ 
        success: true,
        event: newEvent,
        message: `Νέο event δημιουργήθηκε για ${eventTimeStr}. Ειδοποίηση θα σταλεί στις ${new Date(eventTime.getTime() - 5 * 60 * 1000).toTimeString()}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating future event:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});