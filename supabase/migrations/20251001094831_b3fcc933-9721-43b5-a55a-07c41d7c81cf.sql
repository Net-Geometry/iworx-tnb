-- ============================================
-- Enable RLS on business_area table
-- ============================================

-- Enable RLS on the business_area table
ALTER TABLE public.business_area ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for business_area - allow all authenticated users to read
CREATE POLICY "Authenticated users can view business areas"
ON public.business_area
FOR SELECT
TO authenticated
USING (true);

COMMENT ON POLICY "Authenticated users can view business areas" ON public.business_area 
IS 'Allow all authenticated users to view business area reference data';