-- Rename years_experience to years_of_experience in person_skills table
ALTER TABLE public.person_skills 
RENAME COLUMN years_experience TO years_of_experience;