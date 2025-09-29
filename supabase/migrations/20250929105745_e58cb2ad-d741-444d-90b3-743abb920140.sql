-- Create enum types for safety module
CREATE TYPE public.incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.incident_status AS ENUM ('reported', 'investigating', 'resolved', 'closed');
CREATE TYPE public.risk_level AS ENUM ('very_low', 'low', 'medium', 'high', 'very_high');
CREATE TYPE public.capa_status AS ENUM ('open', 'in_progress', 'completed', 'overdue', 'closed');
CREATE TYPE public.loto_status AS ENUM ('draft', 'approved', 'active', 'expired', 'archived');

-- Safety Incidents table
CREATE TABLE public.safety_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_number VARCHAR NOT NULL UNIQUE,
  incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR NOT NULL,
  severity incident_severity NOT NULL DEFAULT 'medium',
  status incident_status NOT NULL DEFAULT 'reported',
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  root_cause TEXT,
  corrective_actions TEXT,
  reporter_name VARCHAR NOT NULL,
  reporter_email VARCHAR,
  investigator_name VARCHAR,
  investigation_notes TEXT,
  cost_estimate NUMERIC,
  regulatory_reporting_required BOOLEAN DEFAULT false,
  regulatory_report_number VARCHAR,
  asset_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Safety Hazards & Risk Register table
CREATE TABLE public.safety_hazards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hazard_number VARCHAR NOT NULL UNIQUE,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR NOT NULL,
  category VARCHAR NOT NULL, -- physical, chemical, biological, ergonomic, psychosocial
  likelihood INTEGER NOT NULL CHECK (likelihood >= 1 AND likelihood <= 5),
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 5),
  risk_score INTEGER GENERATED ALWAYS AS (likelihood * severity) STORED,
  risk_level risk_level GENERATED ALWAYS AS (
    CASE 
      WHEN (likelihood * severity) <= 4 THEN 'very_low'::risk_level
      WHEN (likelihood * severity) <= 8 THEN 'low'::risk_level
      WHEN (likelihood * severity) <= 15 THEN 'medium'::risk_level
      WHEN (likelihood * severity) <= 20 THEN 'high'::risk_level
      ELSE 'very_high'::risk_level
    END
  ) STORED,
  mitigation_measures TEXT,
  responsible_person VARCHAR,
  review_date DATE,
  status VARCHAR NOT NULL DEFAULT 'open',
  asset_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- LOTO Procedures table
CREATE TABLE public.loto_procedures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  procedure_number VARCHAR NOT NULL UNIQUE,
  title VARCHAR NOT NULL,
  equipment_name VARCHAR NOT NULL,
  description TEXT,
  energy_sources TEXT[] NOT NULL,
  lockout_points TEXT[] NOT NULL,
  required_tools TEXT[],
  required_ppe TEXT[],
  procedure_steps JSONB NOT NULL, -- Array of step objects with order, description, safety_notes
  approval_required BOOLEAN DEFAULT true,
  approved_by VARCHAR,
  approved_date DATE,
  review_frequency_months INTEGER DEFAULT 12,
  next_review_date DATE,
  status loto_status NOT NULL DEFAULT 'draft',
  asset_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- CAPA (Corrective and Preventive Actions) table
CREATE TABLE public.capa_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  capa_number VARCHAR NOT NULL UNIQUE,
  title VARCHAR NOT NULL,
  source VARCHAR NOT NULL, -- incident, audit, inspection, observation
  source_reference_id UUID, -- references the source record
  description TEXT NOT NULL,
  root_cause_analysis TEXT,
  corrective_actions TEXT,
  preventive_actions TEXT,
  responsible_person VARCHAR NOT NULL,
  due_date DATE NOT NULL,
  completion_date DATE,
  status capa_status NOT NULL DEFAULT 'open',
  effectiveness_review TEXT,
  effectiveness_verified BOOLEAN DEFAULT false,
  verified_by VARCHAR,
  verified_date DATE,
  priority INTEGER NOT NULL DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Enable RLS on all tables
ALTER TABLE public.safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loto_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capa_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view safety incidents" ON public.safety_incidents FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage safety incidents" ON public.safety_incidents FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view safety hazards" ON public.safety_hazards FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage safety hazards" ON public.safety_hazards FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view LOTO procedures" ON public.loto_procedures FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage LOTO procedures" ON public.loto_procedures FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view CAPA records" ON public.capa_records FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage CAPA records" ON public.capa_records FOR ALL USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_safety_incidents_status ON public.safety_incidents(status);
CREATE INDEX idx_safety_incidents_severity ON public.safety_incidents(severity);
CREATE INDEX idx_safety_incidents_date ON public.safety_incidents(incident_date);
CREATE INDEX idx_safety_hazards_risk_level ON public.safety_hazards(risk_level);
CREATE INDEX idx_safety_hazards_review_date ON public.safety_hazards(review_date);
CREATE INDEX idx_loto_procedures_status ON public.loto_procedures(status);
CREATE INDEX idx_loto_procedures_review_date ON public.loto_procedures(next_review_date);
CREATE INDEX idx_capa_records_status ON public.capa_records(status);
CREATE INDEX idx_capa_records_due_date ON public.capa_records(due_date);

-- Create triggers for updated_at columns
CREATE TRIGGER update_safety_incidents_updated_at
  BEFORE UPDATE ON public.safety_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_safety_hazards_updated_at
  BEFORE UPDATE ON public.safety_hazards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loto_procedures_updated_at
  BEFORE UPDATE ON public.loto_procedures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_capa_records_updated_at
  BEFORE UPDATE ON public.capa_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();