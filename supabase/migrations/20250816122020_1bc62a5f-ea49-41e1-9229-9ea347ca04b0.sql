-- Add notification_sent column to events table to track sent notifications
ALTER TABLE public.events 
ADD COLUMN notification_sent BOOLEAN DEFAULT false;