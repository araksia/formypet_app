-- Change event_date column to timestamp without time zone to store local times
ALTER TABLE public.events 
ALTER COLUMN event_date TYPE timestamp without time zone;