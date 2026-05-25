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
-- ENUM : reading_status
-- ============================================================
CREATE TYPE growlogic.reading_status AS ENUM (
  'optimal',
  'warning',
  'critical'
);

-- ============================================================
-- ENUM : plant_type
-- ============================================================
CREATE TYPE growlogic.plant_type AS ENUM (
  'cactus',
  'succulente',
  'tropicale',
  'arbre',
  'fleur',
  'herbe',
  'fougere',
  'aquatique',
  'grimpante',
  'bonsai',
  'autre'
);

-- ============================================================
-- TABLE : plant
-- ============================================================
CREATE TABLE growlogic.plant (
  "id"          UUID                    NOT NULL DEFAULT gen_random_uuid(),
  "idUser"      UUID                    NOT NULL,
  "name"        TEXT                    NOT NULL,
  "typePlant"   growlogic.plant_type    NOT NULL,
  "mood"        TEXT,
  "aiContext"   JSONB,
  "createdAt"   TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ             NOT NULL DEFAULT NOW(),

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

-- ============================================================
-- TABLE : sensor
-- ============================================================
CREATE TABLE growlogic.sensor (
  "id"          UUID          NOT NULL DEFAULT gen_random_uuid(),
  "idUser"      UUID          NOT NULL,
  "idPlant"     UUID          NOT NULL,
  "type"        TEXT          NOT NULL,
  "name"        TEXT          NOT NULL,
  "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT sensor_pkey PRIMARY KEY ("id"),
  CONSTRAINT sensor_iduser_fkey FOREIGN KEY ("idUser")
    REFERENCES auth.users (id)
    ON DELETE CASCADE,
  CONSTRAINT sensor_idplant_fkey FOREIGN KEY ("idPlant")
    REFERENCES growlogic.plant ("id")
    ON DELETE CASCADE
);

CREATE TRIGGER trg_sensor_updated_at
  BEFORE UPDATE ON growlogic.sensor
  FOR EACH ROW
  EXECUTE FUNCTION growlogic.set_updated_at();

-- ============================================================
-- TABLE : sensor_reading
-- No updatedAt : a sensor reading is immutable
-- ============================================================
CREATE TABLE growlogic.sensor_reading (
  "id"        UUID                      NOT NULL DEFAULT gen_random_uuid(),
  "idSensor"  UUID                      NOT NULL,
  "idUser"    UUID                      NOT NULL,
  "value"     NUMERIC(6, 2)             NOT NULL,
  "unit"      TEXT                      NOT NULL,
  "status"    growlogic.reading_status  NOT NULL,
  "createdAt" TIMESTAMPTZ               NOT NULL DEFAULT NOW(),

  CONSTRAINT sensor_reading_pkey PRIMARY KEY ("id"),
  CONSTRAINT sensor_reading_idsensor_fkey FOREIGN KEY ("idSensor")
    REFERENCES growlogic.sensor ("id")
    ON DELETE CASCADE,
  CONSTRAINT sensor_reading_iduser_fkey FOREIGN KEY ("idUser")
    REFERENCES auth.users (id)
    ON DELETE CASCADE
);
