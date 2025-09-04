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

    // Clean up old push tokens for this user (keep only the latest one)
    const { data: tokensData } = await supabase
      .from('push_notification_tokens')
      .select('id, updated_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (tokensData && tokensData.length > 1) {
      // Keep the first (most recent) and deactivate the rest
      const tokensToDeactivate = tokensData.slice(1).map(t => t.id);
      await supabase
        .from('push_notification_tokens')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in('id', tokensToDeactivate);
    }

    // Check if user has any active push tokens
    const { data: activeTokens } = await supabase
      .from('push_notification_tokens')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (!activeTokens || activeTokens.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Δεν βρέθηκαν ενεργά push tokens. Παρακαλώ ανοίξτε την εφαρμογή στο iPhone για να καταχωρήσετε token.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's first pet
    const { data: pets } = await supabase
      .from('pets')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    if (!pets || pets.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No pets found for user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Reset existing events for today
    await supabase
      .from('events')
      .update({ notification_sent: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .lt('event_date', new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]);

    // Calculate time 3 minutes from now
    const now = new Date();
    const in3Minutes = new Date(now.getTime() + 3 * 60 * 1000);
    const timeString = in3Minutes.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format

    // Create test event
    const { data: newEvent, error: eventError } = await supabase
      .from('events')
      .insert({
        user_id: user.id,
        pet_id: pets[0].id,
        event_type: 'feeding',
        title: 'TEST Push Notification',
        event_date: now.toISOString().split('T')[0],
        event_time: timeString,
        recurring: 'none',
        notes: 'Test notification από το iPhone! 🐾📱',
        notification_sent: false
      })
      .select()
      .single();

    if (eventError) {
      console.error('RESET TEST: Event creation error:', eventError);
      return new Response(
        JSON.stringify({ success: false, error: eventError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = {
      success: true,
      test_event_id: newEvent.id,
      test_time: timeString,
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