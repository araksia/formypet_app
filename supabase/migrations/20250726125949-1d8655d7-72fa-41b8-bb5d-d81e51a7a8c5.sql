-- Add period column to events table
ALTER TABLE public.events 
ADD COLUMN period text;