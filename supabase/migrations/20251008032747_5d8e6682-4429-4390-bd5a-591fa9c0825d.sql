-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP calls from cron
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule Anomaly Detector (every 5 minutes)
SELECT cron.schedule(
  'detect-anomalies',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://jsqzkaarpfowgmijcwaw.supabase.co/functions/v1/anomaly-detector',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcXprYWFycGZvd2dtaWpjd2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTExMTY2MSwiZXhwIjoyMDc0Njg3NjYxfQ.KJO8bWQwvfhRhX7K6aMvU0M3P0sE8ynT9HqB_1F8F8Q"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Schedule ML Predictor (every 10 minutes)
SELECT cron.schedule(
  'generate-ml-predictions',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://jsqzkaarpfowgmijcwaw.supabase.co/functions/v1/ml-predictor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcXprYWFycGZvd2dtaWpjd2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTExMTY2MSwiZXhwIjoyMDc0Njg3NjYxfQ.KJO8bWQwvfhRhX7K6aMvU0M3P0sE8ynT9HqB_1F8F8Q"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Schedule Work Order AI Prioritizer (every 15 minutes)
SELECT cron.schedule(
  'prioritize-work-orders',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://jsqzkaarpfowgmijcwaw.supabase.co/functions/v1/work-order-ai-prioritizer',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcXprYWFycGZvd2dtaWpjd2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTExMTY2MSwiZXhwIjoyMDc0Njg3NjYxfQ.KJO8bWQwvfhRhX7K6aMvU0M3P0sE8ynT9HqB_1F8F8Q"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);