-- Add foreign key constraint to the base meters table in meters_service schema
ALTER TABLE meters_service.meters
ADD CONSTRAINT meters_unit_id_fkey
FOREIGN KEY (unit_id) REFERENCES unit(id) ON DELETE SET NULL;