-- Add 'direct_webhook' option to iot_network_provider enum
ALTER TYPE iot_network_provider ADD VALUE IF NOT EXISTS 'direct_webhook';