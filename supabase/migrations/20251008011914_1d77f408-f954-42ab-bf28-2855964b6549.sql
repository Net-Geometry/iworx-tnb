-- Add missing business_impact_notes column to safety_service.safety_incidents
ALTER TABLE safety_service.safety_incidents
ADD COLUMN IF NOT EXISTS business_impact_notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN safety_service.safety_incidents.business_impact_notes IS 'Notes on business impact of the incident and repair urgency';