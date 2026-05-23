-- ============================================================
-- Migration 001 : Création des tables dans le schema growlogic
-- ============================================================

-- Création du schema si inexistant
CREATE SCHEMA IF NOT EXISTS growlogic;

-- ============================================================
-- TABLE : plant
-- ============================================================
CREATE TABLE growlogic.plant (
  "IdPlant"   UUID          NOT NULL DEFAULT gen_random_uuid(),
  "IdUser"    UUID          NOT NULL,
  "name"      TEXT          NOT NULL,
  "mood"      TEXT,
  "AiContext" JSONB,
  "createdAt" TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "changedAt" TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT plant_pkey PRIMARY KEY ("IdPlant"),
  CONSTRAINT plant_iduser_fkey FOREIGN KEY ("IdUser")
    REFERENCES auth.users (id)
    ON DELETE CASCADE
);

-- Trigger pour mettre à jour "changedAt" automatiquement à chaque modification
CREATE OR REPLACE FUNCTION growlogic.set_changed_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."changedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_plant_changed_at
  BEFORE UPDATE ON growlogic.plant
  FOR EACH ROW
  EXECUTE FUNCTION growlogic.set_changed_at();

-- ============================================================
-- TABLE : question
-- ============================================================
CREATE TABLE growlogic.question (
  "IdQuestion" UUID        NOT NULL DEFAULT gen_random_uuid(),
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "question"   TEXT        NOT NULL,
  "IdPlant"    UUID        NOT NULL,
  "IdUser"     UUID        NOT NULL,

  CONSTRAINT question_pkey PRIMARY KEY ("IdQuestion"),
  CONSTRAINT question_idplant_fkey FOREIGN KEY ("IdPlant")
    REFERENCES growlogic.plant ("IdPlant")
    ON DELETE CASCADE,
  CONSTRAINT question_iduser_fkey FOREIGN KEY ("IdUser")
    REFERENCES auth.users (id)
    ON DELETE CASCADE
);

-- ============================================================
-- TABLE : answer
-- ============================================================
CREATE TABLE growlogic.answer (
  "IdAnswer"   UUID        NOT NULL DEFAULT gen_random_uuid(),
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "answer"     TEXT        NOT NULL,
  "IdQuestion" UUID        NOT NULL UNIQUE,  -- UNIQUE : 1 seule réponse par question
  "IdUser"     UUID        NOT NULL,

  CONSTRAINT answer_pkey PRIMARY KEY ("IdAnswer"),
  CONSTRAINT answer_idquestion_fkey FOREIGN KEY ("IdQuestion")
    REFERENCES growlogic.question ("IdQuestion")
    ON DELETE CASCADE,
  CONSTRAINT answer_iduser_fkey FOREIGN KEY ("IdUser")
    REFERENCES auth.users (id)
    ON DELETE CASCADE
);
