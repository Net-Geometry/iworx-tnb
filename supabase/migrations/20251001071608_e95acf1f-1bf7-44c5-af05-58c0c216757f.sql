-- Add description column to meters table
ALTER TABLE public.meters
ADD COLUMN description TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.meters.description IS 'Detailed description of the meter including purpose, location context, and other relevant details';