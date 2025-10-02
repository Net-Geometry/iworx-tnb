-- Remove health_score column from meters table
ALTER TABLE public.meters DROP COLUMN IF EXISTS health_score;

-- Add unit_id column to meters table
ALTER TABLE public.meters 
ADD COLUMN unit_id integer REFERENCES public.unit(id);