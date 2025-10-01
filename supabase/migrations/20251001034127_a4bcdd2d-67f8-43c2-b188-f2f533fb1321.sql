-- Create person_business_areas junction table
CREATE TABLE public.person_business_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  business_area_id UUID NOT NULL REFERENCES public.business_area(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_primary BOOLEAN DEFAULT false,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(person_id, business_area_id)
);

-- Enable RLS
ALTER TABLE public.person_business_areas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their organization's person business areas"
  ON public.person_business_areas
  FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR (organization_id = ANY (get_user_organizations(auth.uid()))));

CREATE POLICY "Users can insert in their organization"
  ON public.person_business_areas
  FOR INSERT
  WITH CHECK (organization_id = ANY (get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's person business areas"
  ON public.person_business_areas
  FOR UPDATE
  USING (has_cross_project_access(auth.uid()) OR (organization_id = ANY (get_user_organizations(auth.uid()))));

CREATE POLICY "Users can delete their organization's person business areas"
  ON public.person_business_areas
  FOR DELETE
  USING (has_cross_project_access(auth.uid()) OR (organization_id = ANY (get_user_organizations(auth.uid()))));

-- Create trigger for updated_at
CREATE TRIGGER update_person_business_areas_updated_at
  BEFORE UPDATE ON public.person_business_areas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing data from people.business_area_id to junction table
INSERT INTO public.person_business_areas (person_id, business_area_id, organization_id, is_primary, status)
SELECT id, business_area_id, organization_id, true, 'active'
FROM public.people
WHERE business_area_id IS NOT NULL;

-- Remove business_area_id column from people table
ALTER TABLE public.people DROP COLUMN IF EXISTS business_area_id;