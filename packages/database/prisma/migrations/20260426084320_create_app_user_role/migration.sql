-- Create the application role with no login privilege.
-- Idempotent: skip if the role already exists (manual creation,
-- previous migration attempt, etc.).
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user NOLOGIN;
  END IF;
END $$;

-- Note: we cannot ALTER ROLE from the postgres role on Supabase
-- (supautils blocks it). If app_user is found in unexpected
-- state, fix it manually via Supabase SQL Editor as supabase_admin
-- before running this migration.

-- Allow the role to use the public schema.
GRANT USAGE ON SCHEMA public TO app_user;

-- Grant DML on existing tables and sequences.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Inherit DML grants for tables and sequences created in the
-- future by the postgres role (which is what runs migrations).
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO app_user;
