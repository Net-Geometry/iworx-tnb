-- Add 'direct_webhook' to the iot_network_provider enum
ALTER TYPE iot_network_provider ADD VALUE IF NOT EXISTS 'direct_webhook';