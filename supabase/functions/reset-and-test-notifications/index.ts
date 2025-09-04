import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('RESET TEST: Starting function...');
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get auth header and user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('RESET TEST: No authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.log('RESET TEST: Invalid user token:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('RESET TEST: User authenticated:', user.id);

    // Check if user has any active push tokens
    const { data: activeTokens, error: tokensError } = await supabase
      .from('push_notification_tokens')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true);

    console.log('RESET TEST: Active tokens check:', { activeTokens, tokensError });

    if (tokensError) {
      console.error('RESET TEST: Error checking tokens:', tokensError);
      return new Response(
        JSON.stringify({ success: false, error: 'Error checking push tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!activeTokens || activeTokens.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Δεν βρέθηκαν ενεργά push tokens. Παρακαλώ ανοίξτε την εφαρμογή στο iPhone για να καταχωρήσετε token.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's first pet
    const { data: pets, error: petsError } = await supabase
      .from('pets')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    console.log('RESET TEST: Pets check:', { pets, petsError });

    if (petsError) {
      console.error('RESET TEST: Error getting pets:', petsError);
      return new Response(
        JSON.stringify({ success: false, error: 'Error getting pets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!pets || pets.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No pets found for user' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current date and time for Greece timezone
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Calculate time 3 minutes from now  
    const futureTime = new Date(now.getTime() + 3 * 60 * 1000);
    const hours = futureTime.getHours().toString().padStart(2, '0');
    const minutes = futureTime.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    console.log('RESET TEST: Time calculations:', { todayStr, timeStr });

    // Create test event
    const { data: newEvent, error: eventError } = await supabase
      .from('events')
      .insert({
        user_id: user.id,
        pet_id: pets[0].id,
        event_type: 'feeding',
        title: 'TEST Push Notification',
        event_date: todayStr,
        event_time: timeStr,
        recurring: 'none',
        notes: 'Test notification από το iPhone! 🐾📱',
        notification_sent: false
      })
      .select('id')
      .single();

    console.log('RESET TEST: Event creation:', { newEvent, eventError });

    if (eventError) {
      console.error('RESET TEST: Event creation error:', eventError);
      return new Response(
        JSON.stringify({ success: false, error: `Event creation failed: ${eventError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = {
      success: true,
      test_event_id: newEvent.id,
      test_time: timeStr,
      active_tokens: activeTokens.length,
      message: 'Το test event θα στείλει notification σε 3 λεπτά!'
    };

    console.log('RESET TEST: Success result:', data);
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('RESET TEST: Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});