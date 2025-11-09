-- Assign admin role to azri@netgeometry.com
-- First check if role already exists, if not insert it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = '4151b4bd-0357-4e4d-9bef-13886af38940' 
        AND role_id = '8ed5e34a-8911-4814-8615-8df2a4219e78'
    ) THEN
        INSERT INTO user_roles (user_id, role_id) 
        VALUES ('4151b4bd-0357-4e4d-9bef-13886af38940', '8ed5e34a-8911-4814-8615-8df2a4219e78');
    END IF;
END $$;