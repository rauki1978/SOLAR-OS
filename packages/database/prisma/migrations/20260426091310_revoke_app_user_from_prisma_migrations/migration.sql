-- Remove the unintended grants on _prisma_migrations that
-- were swept in by `GRANT ... ON ALL TABLES IN SCHEMA public`.
-- The runtime role must not be able to read or modify the
-- migration history table (would corrupt drift detection
-- and traceability).
--
-- Wrapped in DO/IF EXISTS because Prisma's shadow database
-- applies migrations sequentially without creating its own
-- _prisma_migrations table during the run, so a plain REVOKE
-- fails with 42P01 in shadow even though it succeeds in real.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = '_prisma_migrations'
  ) THEN
    EXECUTE 'REVOKE ALL ON TABLE _prisma_migrations FROM app_user';
  END IF;
END $$;
