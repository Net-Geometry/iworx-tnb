-- Add is_active column to person_skills table
ALTER TABLE people_service.person_skills 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Add comment to explain the column
COMMENT ON COLUMN people_service.person_skills.is_active IS 
'Indicates whether this skill assignment is currently active. Allows soft-deletion of skills.';

-- Create an index for performance since this will be filtered frequently
CREATE INDEX idx_person_skills_is_active 
ON people_service.person_skills(is_active) 
WHERE is_active = true;