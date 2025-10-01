-- Add missing foreign key constraints for meter relationships

-- Add foreign key from asset_meter_groups to meter_groups
ALTER TABLE public.asset_meter_groups
ADD CONSTRAINT asset_meter_groups_meter_group_id_fkey
FOREIGN KEY (meter_group_id)
REFERENCES public.meter_groups(id)
ON DELETE CASCADE;

-- Add foreign key from meter_group_assignments to meters
ALTER TABLE public.meter_group_assignments
ADD CONSTRAINT meter_group_assignments_meter_id_fkey
FOREIGN KEY (meter_id)
REFERENCES public.meters(id)
ON DELETE CASCADE;

-- Add foreign key from meter_group_assignments to meter_groups
ALTER TABLE public.meter_group_assignments
ADD CONSTRAINT meter_group_assignments_meter_group_id_fkey
FOREIGN KEY (meter_group_id)
REFERENCES public.meter_groups(id)
ON DELETE CASCADE;

-- Add foreign key from asset_meter_groups to assets
ALTER TABLE public.asset_meter_groups
ADD CONSTRAINT asset_meter_groups_asset_id_fkey
FOREIGN KEY (asset_id)
REFERENCES public.assets(id)
ON DELETE CASCADE;