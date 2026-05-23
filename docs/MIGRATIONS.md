<h1 align="center">🛢️ MIGRATIONS 🛢️</h1>

<br>
<br>

## SOMMAIRE

- [SUPABASE](#supabase)
- [SCRIPTS MIGRATIONS](#scripts-migrations)
  - [001 - Création des tables (schema GrowLogic)](#migration-001)
  - [002 - Configuration RLS (table Plant)](#migration-002)
  - [003 - Optimisation RLS (insert Plant)](#migration-003)
  - [004 - Permissions PostgreSQL (schema GrowLogic)](#migration-004)
  - [005 - Configuration RLS SELECT (question & answer)](#migration-005)
  - [006 - Configuration RLS INSERT (question)](#migration-006)

<h2 id="supabase">
	<img
		alt="Supabase"
		title="Supabase"
		width="34px"
		src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-original.svg"
	/>
	SUPABASE
</h2>

**Supabase** est une plateforme **Backend-as-a-Service** (**BaaS**) **Open Source**. Celle-ci est souvent présentée comme l'alternative principale à **Firebase**. Son coeur repose sur une base de données **PostgreSQL** robuste et évolutive.  

Contrairement aux architectures traditionnelles où le frontend doit passer par un serveur backend intermédiaire (**Node.js**, **Java**, etc) pour accéder aux données, **Supabase** génère automatiquement une **API REST** (via **PostgREST**) permettant au client (**Angular**) de requêter directement la base. Pour garantir une sécurité absolue dans ce modèle d'accès direct, l'architecture s'appuie massivement sur le **RLS (Row Level Security)**, un mécanisme natif de **PostgreSQL** qui filtre les requêtes au niveau même du moteur de base de données selon l'identité de l'utilisateur connecté.  

Ce document recense l'historique complet des scripts de migration (fichiers **SQL**) nécessaires pour initialiser, structurer et sécuriser la base de données de l'application.  

<h2 id="scripts-migrations">🐘 SCRIPTS MIGRATIONS</h2>

<h3 id="migration-001">001 - Création des tables (schema GrowLogic)</h3>

📄 `001_create_tables.sql`

<details>

  <summary>🧐 Consulter le script</summary>

```SQL
-- ============================================================
-- Migration 001 : Create tables in the 'growlogic' schema
-- ============================================================

-- Create schema if it does not exist
CREATE SCHEMA IF NOT EXISTS growlogic;

-- ============================================================
-- FUNCTION : set_updated_at
-- Trigger function to automatically update 'updatedAt'
-- ============================================================
CREATE OR REPLACE FUNCTION growlogic.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE : plant
-- ============================================================
CREATE TABLE growlogic.plant (
  "id"          UUID          NOT NULL DEFAULT gen_random_uuid(),
  "idUser"      UUID          NOT NULL,
  "name"        TEXT          NOT NULL,
  "mood"        TEXT,
  "aiContext"   JSONB,
  "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT plant_pkey PRIMARY KEY ("id"),
  CONSTRAINT plant_iduser_fkey FOREIGN KEY ("idUser")
    REFERENCES auth.users (id)
    ON DELETE CASCADE
);

CREATE TRIGGER trg_plant_updated_at
  BEFORE UPDATE ON growlogic.plant
  FOR EACH ROW
  EXECUTE FUNCTION growlogic.set_updated_at();

-- ============================================================
-- TABLE : question
-- ============================================================
CREATE TABLE growlogic.question (
  "id"          UUID          NOT NULL DEFAULT gen_random_uuid(),
  "content"     TEXT          NOT NULL,
  "idPlant"     UUID          NOT NULL,
  "idUser"      UUID          NOT NULL,
  "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT question_pkey PRIMARY KEY ("id"),
  CONSTRAINT question_idplant_fkey FOREIGN KEY ("idPlant")
    REFERENCES growlogic.plant ("id")
    ON DELETE CASCADE,
  CONSTRAINT question_iduser_fkey FOREIGN KEY ("idUser")
    REFERENCES auth.users (id)
    ON DELETE CASCADE
);

CREATE TRIGGER trg_question_updated_at
  BEFORE UPDATE ON growlogic.question
  FOR EACH ROW
  EXECUTE FUNCTION growlogic.set_updated_at();

-- ============================================================
-- TABLE : answer
-- ============================================================
CREATE TABLE growlogic.answer (
  "id"          UUID          NOT NULL DEFAULT gen_random_uuid(),
  "content"     TEXT          NOT NULL,
  "idQuestion"  UUID          NOT NULL UNIQUE,
  "idUser"      UUID          NOT NULL,
  "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT answer_pkey PRIMARY KEY ("id"),
  CONSTRAINT answer_idquestion_fkey FOREIGN KEY ("idQuestion")
    REFERENCES growlogic.question ("id")
    ON DELETE CASCADE,
  CONSTRAINT answer_iduser_fkey FOREIGN KEY ("idUser")
    REFERENCES auth.users (id)
    ON DELETE CASCADE
);

CREATE TRIGGER trg_answer_updated_at
  BEFORE UPDATE ON growlogic.answer
  FOR EACH ROW
  EXECUTE FUNCTION growlogic.set_updated_at();
```

</details>

<h3 id="migration-002">002 - Configuration RLS (table Plant)</h3>

📄 `002_rls_plant_create.sql`

<details>

  <summary>🧐 Consulter le script</summary>

```SQL
-- ============================================================
-- Migration 002: RLS + POST endpoint /plant (Create a plant)
-- ============================================================

-- ============================================================
-- 1. Enable Row Level Security (RLS) on all 3 tables
--    Without RLS enabled, all queries bypass security checks
-- ============================================================
ALTER TABLE growlogic.plant    ENABLE ROW LEVEL SECURITY;
ALTER TABLE growlogic.question ENABLE ROW LEVEL SECURITY;
ALTER TABLE growlogic.answer   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. Trigger to automatically inject IdUser = auth.uid()
--    on insert -> the client does not need to send IdUser
-- ============================================================
CREATE OR REPLACE FUNCTION growlogic.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW."idUser" = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_plant_set_user_id
  BEFORE INSERT ON growlogic.plant
  FOR EACH ROW
  EXECUTE FUNCTION growlogic.set_user_id();

-- ============================================================
-- 3. RLS Policy: INSERT on plant
--    Condition: User must be authenticated (auth.uid() is not null)
--    The IdUser of the inserted row must match the logged-in user
-- ============================================================
CREATE POLICY "plant_insert_authenticated"
  ON growlogic.plant
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 4. RLS Policies: SELECT / UPDATE / DELETE on plant
--    A user can only view and modify THEIR own plants
-- ============================================================
CREATE POLICY "plant_select_own"
  ON growlogic.plant
  FOR SELECT
  TO authenticated
  USING ("idUser" = auth.uid());

CREATE POLICY "plant_update_own"
  ON growlogic.plant
  FOR UPDATE
  TO authenticated
  USING ("idUser" = auth.uid())
  WITH CHECK ("idUser" = auth.uid());

CREATE POLICY "plant_delete_own"
  ON growlogic.plant
  FOR DELETE
  TO authenticated
  USING ("idUser" = auth.uid());

-- ============================================================
-- ENDPOINT USAGE (Angular / Client side)
-- ============================================================
-- POST https://<ref>.supabase.co/rest/v1/plant
-- Headers:
--   apikey: <SUPABASE_ANON_KEY>
--   Authorization: Bearer <TOKEN_JWT_USER>
--   Content-Type: application/json
--
-- Body (idUser and id are auto-generated, do not send them):
-- {
--   "name": "Monstera",
--   "mood": "happy",
--   "aiContext": {}
-- }
-- ============================================================
```

</details>

<h3 id="migration-003">003 - Optimisation RLS (insert Plant)</h3>

📄 `003_fix_rls_plant_insert.sql`

<details>

  <summary>🧐 Consulter le script</summary>

```SQL
-- ============================================================
-- Migration 003: Fix plant INSERT policy
-- Validate that the IdUser sent by the client = authenticated user
-- The set_user_id trigger is no longer needed for insertion
-- ============================================================

DROP POLICY IF EXISTS "plant_insert_authenticated" ON growlogic.plant;

CREATE POLICY "plant_insert_authenticated"
  ON growlogic.plant
  FOR INSERT
  TO authenticated
  WITH CHECK ("idUser" = auth.uid());
```

</details>

<h3 id="migration-004">004 - Permissions PostgreSQL (schema GrowLogic)</h3>

📄 `004_grant_schema_permissions.sql`

<details>

  <summary>🧐 Consulter le script</summary>

```SQL
-- ============================================================
-- Migration 004: PostgreSQL permissions on 'growlogic' schema
-- Without these grants, PostgREST denies all requests
-- even if the schema is exposed in Supabase settings
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
```

</details>

<h3 id="migration-005">005 - Configuration RLS SELECT (question & answer)</h3>

📄 `005_rls_question_answer_select.sql`

<details>

  <summary>🧐 Consulter le script</summary>

```SQL
-- ============================================================
-- Migration 005: RLS SELECT policies for question and answer
-- ============================================================

-- SELECT question: User can only see their own questions
CREATE POLICY "question_select_own"
  ON growlogic.question
  FOR SELECT
  TO authenticated
  USING ("idUser" = auth.uid());

-- SELECT answer: User can only see their own answers
CREATE POLICY "answer_select_own"
  ON growlogic.answer
  FOR SELECT
  TO authenticated
  USING ("idUser" = auth.uid());
```

</details>

<h3 id="migration-006">006 - Configuration RLS INSERT (question)</h3>

📄 `006_rls_question_insert.sql`

<details>

  <summary>🧐 Consulter le script</summary>

```SQL
-- ============================================================
-- Migration 006: RLS INSERT policy for question
-- ============================================================

-- INSERT question: User can only create their own questions
CREATE POLICY "question_insert_authenticated"
  ON growlogic.question
  FOR INSERT
  TO authenticated
  WITH CHECK ("idUser" = auth.uid());
```

</details>
