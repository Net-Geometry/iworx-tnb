-- Add TNB-specific columns to people table
ALTER TABLE people 
  ADD COLUMN IF NOT EXISTS position_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS position_abbr VARCHAR(20),
  ADD COLUMN IF NOT EXISTS position_text TEXT,
  ADD COLUMN IF NOT EXISTS employee_category VARCHAR(50),
  ADD COLUMN IF NOT EXISTS complemented VARCHAR(20),
  ADD COLUMN IF NOT EXISTS vacancy_status VARCHAR(50),
  ADD COLUMN IF NOT EXISTS org_unit_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS org_unit_text TEXT,
  ADD COLUMN IF NOT EXISTS job_text TEXT,
  ADD COLUMN IF NOT EXISTS cost_center VARCHAR(50),
  ADD COLUMN IF NOT EXISTS cost_center_text TEXT,
  ADD COLUMN IF NOT EXISTS pa_text TEXT,
  ADD COLUMN IF NOT EXISTS psa_text TEXT,
  ADD COLUMN IF NOT EXISTS holiday_calendar TEXT,
  ADD COLUMN IF NOT EXISTS job_grade VARCHAR(20),
  ADD COLUMN IF NOT EXISTS position_grade_desc TEXT,
  ADD COLUMN IF NOT EXISTS immediate_manager_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS immediate_manager_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS immediate_manager_position VARCHAR(50),
  ADD COLUMN IF NOT EXISTS division TEXT;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_people_employee_number ON people(employee_number);
CREATE INDEX IF NOT EXISTS idx_people_org_unit ON people(org_unit_code);
CREATE INDEX IF NOT EXISTS idx_people_cost_center ON people(cost_center);
CREATE INDEX IF NOT EXISTS idx_people_immediate_manager ON people(immediate_manager_id);
CREATE INDEX IF NOT EXISTS idx_people_position_code ON people(position_code);

-- Add comment to document the schema
COMMENT ON TABLE people IS 'Employee records with TNB-specific organizational data';