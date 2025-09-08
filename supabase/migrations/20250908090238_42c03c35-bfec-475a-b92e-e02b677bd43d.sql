-- Clean up all test tokens from the database
DELETE FROM public.push_notification_tokens 
WHERE platform = 'test_platform' OR token LIKE 'test_token_%';