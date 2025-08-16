-- Disable the scheduled events trigger that's creating duplicates
UPDATE cron.job SET active = false WHERE jobname = 'invoke-check-scheduled-events';