-- Insert profile for the current user
INSERT INTO profiles (id, display_name, email, current_organization_id, created_at, updated_at)
VALUES (
  '4151b4bd-0357-4e4d-9bef-13886af38940',
  'Azri Sukor',
  'azri@example.com',
  'd2b00bd4-7266-4942-b4c8-a5cfcb448daf',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  current_organization_id = EXCLUDED.current_organization_id,
  updated_at = NOW();

-- Link user to MSMS organization
INSERT INTO user_organizations (id, user_id, organization_id, role, created_at)
VALUES (
  gen_random_uuid(),
  '4151b4bd-0357-4e4d-9bef-13886af38940',
  'd2b00bd4-7266-4942-b4c8-a5cfcb448daf',
  'admin',
  NOW()
)
ON CONFLICT (user_id, organization_id) DO NOTHING;