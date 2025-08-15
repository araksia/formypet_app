-- Add function to generate next recurring event date
CREATE OR REPLACE FUNCTION public.calculate_next_event_occurrence(
  base_date TIMESTAMP WITH TIME ZONE,
  recurring_type TEXT,
  event_time TIME WITHOUT TIME ZONE
) RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  next_date TIMESTAMP WITH TIME ZONE;
  base_time_part TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Extract just the date part and combine with event_time
  base_time_part := date_trunc('day', base_date) + event_time;
  
  CASE recurring_type
    WHEN 'daily' THEN
      next_date := base_time_part + INTERVAL '1 day';
    WHEN 'weekly' THEN
      next_date := base_time_part + INTERVAL '1 week';
    WHEN 'monthly' THEN
      next_date := base_time_part + INTERVAL '1 month';
    WHEN '6months' THEN
      next_date := base_time_part + INTERVAL '6 months';
    WHEN 'yearly' THEN
      next_date := base_time_part + INTERVAL '1 year';
    ELSE
      next_date := NULL;
  END CASE;
  
  RETURN next_date;
END;
$$;

-- Add function to create recurring event instances
CREATE OR REPLACE FUNCTION public.create_recurring_event_instance(
  original_event_id UUID,
  next_occurrence TIMESTAMP WITH TIME ZONE
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  original_event RECORD;
  new_event_id UUID;
  event_time_utc TIME WITHOUT TIME ZONE;
BEGIN
  -- Get the original event details
  SELECT * INTO original_event
  FROM public.events
  WHERE id = original_event_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Original event not found';
  END IF;
  
  -- Extract time component in UTC
  event_time_utc := (next_occurrence AT TIME ZONE 'UTC')::TIME;
  
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
    event_time_utc,
    original_event.recurring,
    original_event.notes,
    original_event.period
  ) RETURNING id INTO new_event_id;
  
  RETURN new_event_id;
END;
$$;