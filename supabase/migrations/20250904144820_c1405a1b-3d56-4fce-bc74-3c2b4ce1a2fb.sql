-- Clean up duplicate push tokens and improve the reset_and_test_notifications function

-- First, clean up duplicate push tokens (keep only the most recent active token per user)
WITH ranked_tokens AS (
  SELECT 
    *,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) as rn
  FROM public.push_notification_tokens
  WHERE is_active = true
)
UPDATE public.push_notification_tokens 
SET is_active = false, updated_at = now()
WHERE id IN (
  SELECT id FROM ranked_tokens WHERE rn > 1
);

-- Improve the reset_and_test_notifications function
CREATE OR REPLACE FUNCTION public.reset_and_test_notifications()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  test_event_id uuid;
  user_uuid uuid;
  pet_uuid uuid;
  current_time_plus_3 time;
  active_tokens_count integer;
BEGIN
  -- Get current user
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No authenticated user');
  END IF;

  -- Clean up old push tokens for this user (keep only the latest one)
  WITH ranked_tokens AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY updated_at DESC) as rn
    FROM public.push_notification_tokens
    WHERE user_id = user_uuid AND is_active = true
  )
  UPDATE public.push_notification_tokens 
  SET is_active = false, updated_at = now()
  WHERE user_id = user_uuid 
    AND is_active = true 
    AND id IN (SELECT id FROM ranked_tokens WHERE rn > 1);

  -- Check if user has any active push tokens
  SELECT COUNT(*) INTO active_tokens_count
  FROM public.push_notification_tokens
  WHERE user_id = user_uuid AND is_active = true;
  
  IF active_tokens_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Δεν βρέθηκαν ενεργά push tokens. Παρακαλώ ανοίξτε την εφαρμογή στο iPhone για να καταχωρήσετε token.'
    );
  END IF;
  
  -- Get user's first pet
  SELECT id INTO pet_uuid FROM public.pets WHERE owner_id = user_uuid LIMIT 1;
  
  IF pet_uuid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No pets found for user');
  END IF;
  
  -- Reset existing events for today
  UPDATE public.events 
  SET notification_sent = false, updated_at = now()
  WHERE user_id = user_uuid 
    AND event_date >= CURRENT_DATE
    AND event_date < CURRENT_DATE + INTERVAL '1 day';
  
  -- Calculate time 3 minutes from now
  current_time_plus_3 := (CURRENT_TIME + INTERVAL '3 minutes')::time;
  
  -- Create test event
  INSERT INTO public.events (
    user_id, 
    pet_id, 
    event_type, 
    title, 
    event_date, 
    event_time, 
    recurring, 
    notes, 
    notification_sent
  ) VALUES (
    user_uuid,
    pet_uuid,
    'feeding',
    'TEST Push Notification',
    CURRENT_DATE,
    current_time_plus_3,
    'none',
    'Test notification από το iPhone! 🐾📱',
    false
  ) RETURNING id INTO test_event_id;
  
  result := jsonb_build_object(
    'success', true,
    'test_event_id', test_event_id,
    'test_time', current_time_plus_3,
    'active_tokens', active_tokens_count,
    'message', 'Το test event θα στείλει notification σε 3 λεπτά!'
  );
  
  RETURN result;
END;
$$;