-- Create cron job to check for scheduled events every 5 minutes
SELECT cron.schedule(
  'check-scheduled-events',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://vbwhtwocpobplearoooq.supabase.co/functions/v1/check-scheduled-events',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid2h0d29jcG9icGxlYXJvb29xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4NDQ5OCwiZXhwIjoyMDY4MDYwNDk4fQ.hGTUu3f6KIDYOZOFtB8m3dKPAFv8kIhSTlnV3KNBJWw"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);