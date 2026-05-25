-- ============================================================
-- Migration 003 : PostgreSQL permissions on 'growlogic' schema
--    Without these grants, PostgREST denies all requests
--    even if the schema is exposed in Supabase settings
-- ============================================================

-- Allow roles to access the schema
GRANT USAGE ON SCHEMA growlogic TO anon, authenticated, service_role;

-- Allow roles to perform operations on tables
GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA growlogic
  TO anon, authenticated, service_role;

-- Allow roles to use sequences (Auto UUIDs, etc.)
GRANT USAGE, SELECT
  ON ALL SEQUENCES IN SCHEMA growlogic
  TO anon, authenticated, service_role;

-- Apply default privileges to future tables created in this schema
ALTER DEFAULT PRIVILEGES IN SCHEMA growlogic
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES
  TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA growlogic
  GRANT USAGE, SELECT ON SEQUENCES
  TO anon, authenticated, service_role;
