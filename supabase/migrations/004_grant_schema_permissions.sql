-- ============================================================
-- Migration 004 : Permissions PostgreSQL sur le schema growlogic
-- Sans ces grants, PostgREST refuse toutes les requêtes
-- même si le schema est exposé dans les settings Supabase
-- ============================================================

-- Autoriser les rôles à accéder au schema
GRANT USAGE ON SCHEMA growlogic TO anon, authenticated, service_role;

-- Autoriser les rôles à opérer sur les tables
GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA growlogic
  TO anon, authenticated, service_role;

-- Autoriser les rôles à utiliser les séquences (UUID auto, etc.)
GRANT USAGE, SELECT
  ON ALL SEQUENCES IN SCHEMA growlogic
  TO anon, authenticated, service_role;

-- Appliquer aussi aux futures tables créées dans ce schema
ALTER DEFAULT PRIVILEGES IN SCHEMA growlogic
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES
  TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA growlogic
  GRANT USAGE, SELECT ON SEQUENCES
  TO anon, authenticated, service_role;
