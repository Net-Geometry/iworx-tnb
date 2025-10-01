-- ============================================
-- Create Domain Events Table for Event Sourcing
-- ============================================

CREATE TABLE IF NOT EXISTS public.domain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  service_name TEXT NOT NULL,
  correlation_id TEXT,
  payload JSONB NOT NULL,
  metadata JSONB,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_domain_events_event_type ON public.domain_events(event_type);
CREATE INDEX idx_domain_events_service_name ON public.domain_events(service_name);
CREATE INDEX idx_domain_events_correlation_id ON public.domain_events(correlation_id);
CREATE INDEX idx_domain_events_published_at ON public.domain_events(published_at DESC);

-- Enable RLS
ALTER TABLE public.domain_events ENABLE ROW LEVEL SECURITY;

-- Create policies for domain events
CREATE POLICY "System services can insert events"
ON public.domain_events
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can view events"
ON public.domain_events
FOR SELECT
TO authenticated
USING (true);

-- Add comments
COMMENT ON TABLE public.domain_events IS 'Stores all domain events for event sourcing and audit trail';
COMMENT ON COLUMN public.domain_events.event_id IS 'Unique identifier for the event';
COMMENT ON COLUMN public.domain_events.correlation_id IS 'ID for tracing requests across services';
COMMENT ON COLUMN public.domain_events.processed_by IS 'Array of services that have processed this event';