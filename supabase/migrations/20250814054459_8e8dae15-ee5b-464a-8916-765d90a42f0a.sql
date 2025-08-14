-- Enable the pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable the pg_net extension for HTTP requests  
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job that runs every minute to check for scheduled events
SELECT cron.schedule(
  'check-scheduled-events',
  '* * * * *', -- every minute
  $$
  SELECT
    net.http_post(
        url:='https://vbwhtwocpobplearoooq.supabase.co/functions/v1/check-scheduled-events',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid2h0d29jcG9icGxlYXJvb29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODQ0OTgsImV4cCI6MjA2ODA2MDQ5OH0.Ui3q4plAY6QmO6M64s8_K4667FXHKm_ukiawPhC1IR8"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);