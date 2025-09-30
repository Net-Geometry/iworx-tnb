-- Add user_id column to link people to user accounts
ALTER TABLE public.people 
ADD COLUMN user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add unique constraint to prevent duplicate user links
ALTER TABLE public.people 
ADD CONSTRAINT people_user_id_unique UNIQUE (user_id);

-- Fix the id column default if it's not set
ALTER TABLE public.people 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Create an index for faster lookups
CREATE INDEX idx_people_user_id ON public.people(user_id);

-- Create a function to import users as people
CREATE OR REPLACE FUNCTION public.import_user_as_person(
  _user_id uuid,
  _employee_number varchar
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _person_id uuid;
  _display_name text;
BEGIN
  -- Get the display name from profiles
  SELECT display_name INTO _display_name
  FROM public.profiles
  WHERE id = _user_id;

  -- Insert the person record
  INSERT INTO public.people (
    user_id,
    employee_number,
    first_name,
    last_name,
    email
  )
  VALUES (
    _user_id,
    _employee_number,
    COALESCE(split_part(_display_name, ' ', 1), 'Unknown'),
    COALESCE(split_part(_display_name, ' ', 2), ''),
    (SELECT email FROM auth.users WHERE id = _user_id)
  )
  RETURNING id INTO _person_id;

  RETURN _person_id;
END;
$$;