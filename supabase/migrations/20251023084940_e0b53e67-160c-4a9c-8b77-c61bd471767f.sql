-- Create temporary table for testing webhook data from third-party IoT systems
CREATE TABLE iot_webhook_test_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at timestamptz NOT NULL DEFAULT now(),
  device_identifier text,
  raw_payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Index for quick lookup by device and time
CREATE INDEX idx_webhook_test_device ON iot_webhook_test_data(device_identifier);
CREATE INDEX idx_webhook_test_received ON iot_webhook_test_data(received_at DESC);

-- Enable RLS (allow all for service role)
ALTER TABLE iot_webhook_test_data ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role can manage test data" 
ON iot_webhook_test_data 
FOR ALL 
USING (true);

-- Allow authenticated users to view test data for monitoring
CREATE POLICY "Authenticated users can view test data" 
ON iot_webhook_test_data 
FOR SELECT 
USING (auth.role() = 'authenticated');

COMMENT ON TABLE iot_webhook_test_data IS 'Temporary table for testing third-party IoT webhook integrations. Stores raw payloads for verification before moving to production.';