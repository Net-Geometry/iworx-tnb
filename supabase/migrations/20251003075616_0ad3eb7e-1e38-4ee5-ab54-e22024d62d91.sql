-- Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name);
  
  RETURN NEW;
END;
$$;

-- Backfill existing user emails from auth.users to profiles
-- This uses a DO block to iterate through auth.users and update profiles
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id, email 
    FROM auth.users
  LOOP
    UPDATE public.profiles 
    SET email = user_record.email
    WHERE id = user_record.id AND email IS NULL;
  END LOOP;
END $$;

-- Add NOT NULL constraint after backfill
ALTER TABLE public.profiles 
ALTER COLUMN email SET NOT NULL;

-- Add unique constraint on email
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_email_unique UNIQUE (email);