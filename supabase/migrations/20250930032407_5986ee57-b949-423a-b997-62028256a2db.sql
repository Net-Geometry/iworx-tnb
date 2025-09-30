-- Drop the incorrect foreign key constraint that links people.id to profiles.id
ALTER TABLE people DROP CONSTRAINT IF EXISTS people_id_fkey;