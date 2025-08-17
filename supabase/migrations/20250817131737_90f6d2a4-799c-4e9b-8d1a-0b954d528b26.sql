-- Clean up all scheduled events and notifications
DELETE FROM public.events;

-- Reset any notification sent flags (if there were any remaining)
UPDATE public.events SET notification_sent = false WHERE notification_sent = true;

-- Clean up push notification tokens if needed (optional - keeps user tokens but resets state)
-- UPDATE public.push_notification_tokens SET is_active = true WHERE is_active = false;