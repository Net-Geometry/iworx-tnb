-- Add missing foreign key constraints to assets_service.asset_meter_groups table
-- Uses conditional logic to only add constraints that don't already exist

-- Add FK to meter_groups (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'asset_meter_groups_meter_group_id_fkey'
  ) THEN
    ALTER TABLE assets_service.asset_meter_groups 
    ADD CONSTRAINT asset_meter_groups_meter_group_id_fkey 
    FOREIGN KEY (meter_group_id) 
    REFERENCES meters_service.groups(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add FK to organizations (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'asset_meter_groups_organization_id_fkey'
  ) THEN
    ALTER TABLE assets_service.asset_meter_groups 
    ADD CONSTRAINT asset_meter_groups_organization_id_fkey 
    FOREIGN KEY (organization_id) 
    REFERENCES public.organizations(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Create performance indexes (if not exists)
CREATE INDEX IF NOT EXISTS idx_asset_meter_groups_meter_group_id 
ON assets_service.asset_meter_groups(meter_group_id);

CREATE INDEX IF NOT EXISTS idx_asset_meter_groups_asset_id 
ON assets_service.asset_meter_groups(asset_id);

CREATE INDEX IF NOT EXISTS idx_asset_meter_groups_organization_id 
ON assets_service.asset_meter_groups(organization_id);