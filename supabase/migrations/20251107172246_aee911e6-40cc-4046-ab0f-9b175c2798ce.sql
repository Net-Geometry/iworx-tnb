-- Update person_skills view to include is_active column
CREATE OR REPLACE VIEW public.person_skills
WITH(security_invoker=true)
AS SELECT 
    id,
    person_id,
    skill_id,
    proficiency_level,
    years_of_experience,
    certified,
    certification_date,
    certification_expiry,
    notes,
    created_at,
    updated_at,
    organization_id,
    is_active
FROM people_service.person_skills;