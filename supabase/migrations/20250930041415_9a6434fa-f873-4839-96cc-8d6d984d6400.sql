-- Update import_user_as_person function to accept organization_id parameter
CREATE OR REPLACE FUNCTION public.import_user_as_person(_user_id uuid, _employee_number character varying, _organization_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _person_id uuid;
  _display_name text;
  _org_id uuid;
BEGIN
  -- Get the display name from profiles
  SELECT display_name INTO _display_name
  FROM public.profiles
  WHERE id = _user_id;

  -- Use provided organization_id or default to MSMS
  IF _organization_id IS NULL THEN
    SELECT id INTO _org_id FROM public.organizations WHERE code = 'MSMS';
  ELSE
    _org_id := _organization_id;
  END IF;

  -- Insert the person record
  INSERT INTO public.people (
    user_id,
    employee_number,
    first_name,
    last_name,
    email,
    organization_id
  )
  VALUES (
    _user_id,
    _employee_number,
    COALESCE(split_part(_display_name, ' ', 1), 'Unknown'),
    COALESCE(split_part(_display_name, ' ', 2), ''),
    (SELECT email FROM auth.users WHERE id = _user_id),
    _org_id
  )
  RETURNING id INTO _person_id;

  RETURN _person_id;
END;
$$;