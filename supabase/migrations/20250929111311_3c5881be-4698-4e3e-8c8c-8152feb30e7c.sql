-- Create enum for precaution severity levels
CREATE TYPE public.precaution_severity AS ENUM ('critical', 'high', 'medium', 'low');

-- Create enum for precaution status
CREATE TYPE public.precaution_status AS ENUM ('active', 'under_review', 'archived');

-- Create safety_precautions table
CREATE TABLE public.safety_precautions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  precaution_code CHARACTER VARYING NOT NULL UNIQUE,
  title CHARACTER VARYING NOT NULL,
  description TEXT NOT NULL,
  category CHARACTER VARYING NOT NULL,
  subcategory CHARACTER VARYING,
  severity_level precaution_severity NOT NULL DEFAULT 'medium',
  applicable_scenarios JSONB DEFAULT '[]'::jsonb,
  required_actions TEXT[],
  associated_hazards TEXT[],
  regulatory_references TEXT[],
  status precaution_status NOT NULL DEFAULT 'active',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Enable RLS
ALTER TABLE public.safety_precautions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view safety precautions" 
ON public.safety_precautions 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage safety precautions" 
ON public.safety_precautions 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_safety_precautions_category ON public.safety_precautions(category);
CREATE INDEX idx_safety_precautions_severity ON public.safety_precautions(severity_level);
CREATE INDEX idx_safety_precautions_status ON public.safety_precautions(status);
CREATE INDEX idx_safety_precautions_code ON public.safety_precautions(precaution_code);

-- Create trigger for updated_at
CREATE TRIGGER update_safety_precautions_updated_at
  BEFORE UPDATE ON public.safety_precautions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.safety_precautions (precaution_code, title, description, category, subcategory, severity_level, required_actions, associated_hazards, regulatory_references) VALUES
('PPE-001', 'Hard Hat Required', 'Hard hats must be worn in all construction and maintenance areas to protect against falling objects and head injuries.', 'PPE', 'Head Protection', 'critical', ARRAY['Ensure hard hat is properly fitted', 'Check for cracks or damage before use', 'Replace if damaged'], ARRAY['Falling objects', 'Head injuries', 'Impact hazards'], ARRAY['OSHA 1926.95', 'ANSI Z89.1']),
('CHEM-015', 'Chemical Splash Protection', 'Wear appropriate chemical-resistant clothing and eye protection when handling corrosive substances.', 'Chemical Safety', 'Corrosives', 'high', ARRAY['Wear chemical-resistant gloves', 'Use safety goggles or face shield', 'Ensure proper ventilation'], ARRAY['Chemical burns', 'Eye injuries', 'Skin contact'], ARRAY['OSHA 1910.132', 'ANSI Z87.1']),
('ELEC-008', 'Lockout/Tagout Required', 'All electrical equipment must be properly locked out and tagged out before maintenance work begins.', 'Electrical Safety', 'Energy Control', 'critical', ARRAY['Turn off power at source', 'Apply lockout device', 'Tag with identification', 'Test equipment is de-energized'], ARRAY['Electrical shock', 'Arc flash', 'Electrocution'], ARRAY['OSHA 1910.147', 'NFPA 70E']),
('MECH-022', 'Pinch Point Awareness', 'Be aware of pinch points and moving parts when working near conveyor systems and rotating equipment.', 'Mechanical Safety', 'Moving Parts', 'high', ARRAY['Keep hands and loose clothing away', 'Use proper tools', 'Ensure guards are in place'], ARRAY['Crushing injuries', 'Caught-in hazards', 'Amputation'], ARRAY['OSHA 1910.212', 'ANSI B11.0']),
('ENV-005', 'Confined Space Entry', 'Follow proper confined space entry procedures including atmospheric testing and continuous monitoring.', 'Environmental Safety', 'Confined Spaces', 'critical', ARRAY['Test atmosphere before entry', 'Use continuous monitoring', 'Maintain communication with attendant', 'Have rescue plan ready'], ARRAY['Oxygen deficiency', 'Toxic gases', 'Engulfment'], ARRAY['OSHA 1910.146', 'NIOSH 80-106']);