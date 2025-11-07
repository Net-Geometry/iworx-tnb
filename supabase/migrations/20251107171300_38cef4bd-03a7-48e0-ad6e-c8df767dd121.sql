-- Rename years_experience to years_of_experience in people_service schema
ALTER TABLE people_service.person_skills 
RENAME COLUMN years_experience TO years_of_experience;