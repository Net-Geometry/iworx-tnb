-- Fix missing meter data for meters with NULL values
UPDATE meters 
SET 
  meter_type = 'monitoring',
  status = 'active',
  updated_at = now()
WHERE meter_number = 'SG_33_GIS_1' AND meter_type IS NULL;

UPDATE meters 
SET 
  meter_type = 'monitoring', 
  status = 'active',
  updated_at = now()
WHERE meter_number = 'SG_33_GIS_3' AND meter_type IS NULL;