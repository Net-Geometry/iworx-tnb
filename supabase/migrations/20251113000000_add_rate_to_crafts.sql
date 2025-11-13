-- Add rate column to crafts table for storing hourly labor rate
ALTER TABLE people_service.crafts 
ADD COLUMN IF NOT EXISTS rate NUMERIC(10,2);

COMMENT ON COLUMN people_service.crafts.rate IS 'Hourly rate for this craft in local currency';
