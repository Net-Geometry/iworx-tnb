-- Populate current_organization_id for all existing users who have NULL
-- This sets it to their first organization from user_organizations table

UPDATE public.profiles p
SET current_organization_id = (
  SELECT uo.organization_id
  FROM public.user_organizations uo
  WHERE uo.user_id = p.id
  ORDER BY uo.created_at ASC
  LIMIT 1
)
WHERE p.current_organization_id IS NULL
AND EXISTS (
  SELECT 1 FROM public.user_organizations uo2
  WHERE uo2.user_id = p.id
);