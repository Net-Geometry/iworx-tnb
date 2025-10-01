-- Create work_order_meter_readings table
CREATE TABLE public.work_order_meter_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  work_order_id UUID NOT NULL,
  meter_group_id UUID NOT NULL,
  reading_value NUMERIC NOT NULL,
  reading_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recorded_by UUID REFERENCES auth.users(id),
  notes TEXT,
  is_validated BOOLEAN DEFAULT false,
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.work_order_meter_readings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their organization's meter readings"
  ON public.work_order_meter_readings
  FOR SELECT
  USING (
    has_cross_project_access(auth.uid()) OR 
    (organization_id = ANY (get_user_organizations(auth.uid())))
  );

CREATE POLICY "Users can insert in their organization"
  ON public.work_order_meter_readings
  FOR INSERT
  WITH CHECK (organization_id = ANY (get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their organization's meter readings"
  ON public.work_order_meter_readings
  FOR UPDATE
  USING (
    has_cross_project_access(auth.uid()) OR 
    (organization_id = ANY (get_user_organizations(auth.uid())))
  );

CREATE POLICY "Users can delete their organization's meter readings"
  ON public.work_order_meter_readings
  FOR DELETE
  USING (
    has_cross_project_access(auth.uid()) OR 
    (organization_id = ANY (get_user_organizations(auth.uid())))
  );

-- Add trigger for updated_at
CREATE TRIGGER update_work_order_meter_readings_updated_at
  BEFORE UPDATE ON public.work_order_meter_readings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();