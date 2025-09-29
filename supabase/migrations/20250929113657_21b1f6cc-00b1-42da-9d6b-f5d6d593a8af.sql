-- Create enum types for job plans
CREATE TYPE public.job_type AS ENUM ('preventive', 'corrective', 'predictive', 'emergency', 'shutdown');
CREATE TYPE public.skill_level AS ENUM ('basic', 'intermediate', 'advanced', 'specialist');
CREATE TYPE public.job_plan_status AS ENUM ('draft', 'active', 'under_review', 'archived');
CREATE TYPE public.frequency_type AS ENUM ('time_based', 'usage_based', 'condition_based');
CREATE TYPE public.document_type AS ENUM ('manual', 'schematic', 'checklist', 'image', 'video');

-- Create job_plans table
CREATE TABLE public.job_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_plan_number VARCHAR NOT NULL UNIQUE,
    title VARCHAR NOT NULL,
    description TEXT,
    job_type job_type DEFAULT 'preventive',
    category VARCHAR,
    subcategory VARCHAR,
    estimated_duration_hours NUMERIC,
    skill_level_required skill_level DEFAULT 'basic',
    status job_plan_status DEFAULT 'draft',
    version VARCHAR DEFAULT '1.0',
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    applicable_asset_types TEXT[],
    frequency_type frequency_type DEFAULT 'time_based',
    frequency_interval INTEGER,
    priority VARCHAR DEFAULT 'medium',
    cost_estimate NUMERIC,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_plan_tasks table
CREATE TABLE public.job_plan_tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_plan_id UUID NOT NULL REFERENCES public.job_plans(id) ON DELETE CASCADE,
    task_sequence INTEGER NOT NULL,
    task_title VARCHAR NOT NULL,
    task_description TEXT,
    estimated_duration_minutes INTEGER,
    skill_required VARCHAR,
    safety_precaution_ids UUID[],
    is_critical_step BOOLEAN DEFAULT false,
    completion_criteria TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_plan_parts table
CREATE TABLE public.job_plan_parts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_plan_id UUID NOT NULL REFERENCES public.job_plans(id) ON DELETE CASCADE,
    inventory_item_id UUID,
    part_name VARCHAR NOT NULL,
    part_number VARCHAR,
    quantity_required NUMERIC NOT NULL DEFAULT 1,
    is_critical_part BOOLEAN DEFAULT false,
    alternative_part_ids UUID[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_plan_tools table
CREATE TABLE public.job_plan_tools (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_plan_id UUID NOT NULL REFERENCES public.job_plans(id) ON DELETE CASCADE,
    tool_name VARCHAR NOT NULL,
    tool_description TEXT,
    is_specialized_tool BOOLEAN DEFAULT false,
    quantity_required INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_plan_documents table
CREATE TABLE public.job_plan_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_plan_id UUID NOT NULL REFERENCES public.job_plans(id) ON DELETE CASCADE,
    document_name VARCHAR NOT NULL,
    document_type document_type DEFAULT 'manual',
    file_path TEXT,
    file_size BIGINT,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.job_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_plan_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_plan_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_plan_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for job_plans
CREATE POLICY "Anyone can view job plans" ON public.job_plans FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage job plans" ON public.job_plans FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for job_plan_tasks
CREATE POLICY "Anyone can view job plan tasks" ON public.job_plan_tasks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage job plan tasks" ON public.job_plan_tasks FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for job_plan_parts
CREATE POLICY "Anyone can view job plan parts" ON public.job_plan_parts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage job plan parts" ON public.job_plan_parts FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for job_plan_tools
CREATE POLICY "Anyone can view job plan tools" ON public.job_plan_tools FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage job plan tools" ON public.job_plan_tools FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for job_plan_documents
CREATE POLICY "Anyone can view job plan documents" ON public.job_plan_documents FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage job plan documents" ON public.job_plan_documents FOR ALL USING (auth.uid() IS NOT NULL);

-- Create triggers for updating timestamps
CREATE TRIGGER update_job_plans_updated_at
    BEFORE UPDATE ON public.job_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_plan_tasks_updated_at
    BEFORE UPDATE ON public.job_plan_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_plan_parts_updated_at
    BEFORE UPDATE ON public.job_plan_parts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_plan_tools_updated_at
    BEFORE UPDATE ON public.job_plan_tools
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_plan_documents_updated_at
    BEFORE UPDATE ON public.job_plan_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_job_plans_status ON public.job_plans(status);
CREATE INDEX idx_job_plans_job_type ON public.job_plans(job_type);
CREATE INDEX idx_job_plans_category ON public.job_plans(category);
CREATE INDEX idx_job_plan_tasks_plan_id ON public.job_plan_tasks(job_plan_id);
CREATE INDEX idx_job_plan_tasks_sequence ON public.job_plan_tasks(job_plan_id, task_sequence);
CREATE INDEX idx_job_plan_parts_plan_id ON public.job_plan_parts(job_plan_id);
CREATE INDEX idx_job_plan_tools_plan_id ON public.job_plan_tools(job_plan_id);
CREATE INDEX idx_job_plan_documents_plan_id ON public.job_plan_documents(job_plan_id);