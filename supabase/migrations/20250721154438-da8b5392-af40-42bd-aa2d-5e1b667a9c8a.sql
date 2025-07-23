-- Create medical records for existing events that have already happened
INSERT INTO public.medical_records (
  pet_id,
  user_id,
  record_type,
  title,
  date,
  description,
  event_id
)
SELECT 
  e.pet_id,
  e.user_id,
  e.event_type,
  e.title,
  e.event_date::date,
  e.notes,
  e.id
FROM public.events e
WHERE e.event_type IN ('vaccination', 'checkup', 'medication')
  AND e.event_date <= CURRENT_DATE
  AND NOT EXISTS (
    SELECT 1 FROM public.medical_records mr 
    WHERE mr.event_id = e.id
  );