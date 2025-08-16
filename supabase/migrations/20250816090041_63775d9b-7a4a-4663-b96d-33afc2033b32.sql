-- Update the calculate_next_event_occurrence function to handle local times properly
CREATE OR REPLACE FUNCTION public.calculate_next_event_occurrence(base_date timestamp with time zone, recurring_type text, event_time time without time zone)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  next_date TIMESTAMP WITH TIME ZONE;
  base_local_date DATE;
  next_local_date DATE;
  final_datetime TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Extract the local date part
  base_local_date := base_date::date;
  
  -- Calculate the next occurrence date based on recurring type
  CASE recurring_type
    WHEN 'daily' THEN
      next_local_date := base_local_date + INTERVAL '1 day';
    WHEN 'weekly' THEN
      next_local_date := base_local_date + INTERVAL '1 week';
    WHEN 'monthly' THEN
      next_local_date := base_local_date + INTERVAL '1 month';
    WHEN '6months' THEN
      next_local_date := base_local_date + INTERVAL '6 months';
    WHEN 'yearly' THEN
      next_local_date := base_local_date + INTERVAL '1 year';
    ELSE
      RETURN NULL;
  END CASE;
  
  -- Combine the next date with the event time (which is stored as local time)
  IF event_time IS NOT NULL THEN
    final_datetime := (next_local_date::text || ' ' || event_time::text)::timestamp;
  ELSE
    final_datetime := next_local_date::timestamp;
  END IF;
  
  RETURN final_datetime;
END;
$function$;

-- Update the create_recurring_event_instance function to handle local times
CREATE OR REPLACE FUNCTION public.create_recurring_event_instance(original_event_id uuid, next_occurrence timestamp with time zone)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  original_event RECORD;
  new_event_id UUID;
  local_time TIME WITHOUT TIME ZONE;
BEGIN
  -- Get the original event details
  SELECT * INTO original_event
  FROM public.events
  WHERE id = original_event_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Original event not found';
  END IF;
  
  -- Use the original event's time (which is already stored as local time)
  local_time := original_event.event_time;
  
  -- Create new event instance
  INSERT INTO public.events (
    user_id,
    pet_id,
    event_type,
    title,
    event_date,
    event_time,
    recurring,
    notes,
    period
  ) VALUES (
    original_event.user_id,
    original_event.pet_id,
    original_event.event_type,
    original_event.title,
    next_occurrence,
    local_time,
    original_event.recurring,
    original_event.notes,
    original_event.period
  ) RETURNING id INTO new_event_id;
  
  RETURN new_event_id;
END;
$function$;