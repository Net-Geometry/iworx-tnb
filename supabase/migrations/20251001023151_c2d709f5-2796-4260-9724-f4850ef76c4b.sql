-- Add business_area_id column to people table
ALTER TABLE public.people 
ADD COLUMN business_area_id uuid REFERENCES public.business_area(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_people_business_area_id ON public.people(business_area_id);

-- Add comment for documentation
COMMENT ON COLUMN public.people.business_area_id IS 'Reference to the business area this person is assigned to';