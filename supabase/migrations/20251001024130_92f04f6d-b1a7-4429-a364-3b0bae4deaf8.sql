-- Add foreign key constraints
ALTER TABLE public.person_crafts
  ADD CONSTRAINT person_crafts_craft_id_fkey
  FOREIGN KEY (craft_id) REFERENCES public.crafts(id) ON DELETE CASCADE;

ALTER TABLE public.person_crafts
  ADD CONSTRAINT person_crafts_person_id_fkey
  FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE CASCADE;