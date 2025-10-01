-- Create crafts table
CREATE TABLE public.crafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name VARCHAR NOT NULL,
  code VARCHAR,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create person_crafts table for many-to-many relationship
CREATE TABLE public.person_crafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID NOT NULL,
  craft_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  proficiency_level VARCHAR DEFAULT 'beginner',
  certification_status VARCHAR DEFAULT 'none',
  assigned_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(person_id, craft_id)
);

-- Enable RLS on crafts table
ALTER TABLE public.crafts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on person_crafts table
ALTER TABLE public.person_crafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crafts table
CREATE POLICY "Users can view their organization's crafts"
  ON public.crafts FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert in their organization"
  ON public.crafts FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's crafts"
  ON public.crafts FOR UPDATE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their organization's crafts"
  ON public.crafts FOR DELETE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

-- RLS Policies for person_crafts table
CREATE POLICY "Users can view their organization's person crafts"
  ON public.person_crafts FOR SELECT
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert in their organization"
  ON public.person_crafts FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's person crafts"
  ON public.person_crafts FOR UPDATE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their organization's person crafts"
  ON public.person_crafts FOR DELETE
  USING (has_cross_project_access(auth.uid()) OR organization_id = ANY(get_user_organizations(auth.uid())));

-- Create trigger for updated_at on crafts
CREATE TRIGGER update_crafts_updated_at
  BEFORE UPDATE ON public.crafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on person_crafts
CREATE TRIGGER update_person_crafts_updated_at
  BEFORE UPDATE ON public.person_crafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();