-- Add current_organization_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN current_organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_profiles_current_organization ON public.profiles(current_organization_id);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.current_organization_id IS 'The currently selected organization for this user. Updated when user switches organizations in the UI.';