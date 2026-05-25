-- ============================================================
-- Migration 005 : RLS policies for sensor routes
--   GET    /sensor        → SELECT
--   POST   /sensor        → INSERT
--   PATCH  /sensor?id=eq. → UPDATE
--   DELETE /sensor?id=eq. → DELETE
-- ============================================================

-- ============================================================
-- 1. Enable Row Level Security on sensor table
-- ============================================================
ALTER TABLE growlogic.sensor ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. RLS Policy : INSERT on sensor
--    User can only create sensors linked to their own account
-- ============================================================
CREATE POLICY "sensor_insert_authenticated"
  ON growlogic.sensor
  FOR INSERT
  TO authenticated
  WITH CHECK ("idUser" = auth.uid());

-- ============================================================
-- 3. RLS Policy : SELECT on sensor
--    User can only see their own sensors
-- ============================================================
CREATE POLICY "sensor_select_own"
  ON growlogic.sensor
  FOR SELECT
  TO authenticated
  USING ("idUser" = auth.uid());

-- ============================================================
-- 4. RLS Policy : UPDATE on sensor
--    User can only update their own sensors
-- ============================================================
CREATE POLICY "sensor_update_own"
  ON growlogic.sensor
  FOR UPDATE
  TO authenticated
  USING ("idUser" = auth.uid())
  WITH CHECK ("idUser" = auth.uid());

-- ============================================================
-- 5. RLS Policy : DELETE on sensor
--    User can only delete their own sensors
-- ============================================================
CREATE POLICY "sensor_delete_own"
  ON growlogic.sensor
  FOR DELETE
  TO authenticated
  USING ("idUser" = auth.uid());

-- ============================================================
-- ENDPOINT USAGE (Angular / Client side)
-- ============================================================
-- GET    https://<ref>.supabase.co/rest/v1/sensor
-- POST   https://<ref>.supabase.co/rest/v1/sensor
-- PATCH  https://<ref>.supabase.co/rest/v1/sensor?id=eq.<UUID>
-- DELETE https://<ref>.supabase.co/rest/v1/sensor?id=eq.<UUID>
--
-- Headers:
--   apikey: <SUPABASE_ANON_KEY>
--   Authorization: Bearer <TOKEN_JWT_USER>
--   Content-Type: application/json
--   Prefer: return=representation          ← pour récupérer l'objet créé en réponse
--
-- POST Body (idUser et id sont auto-générés, ne pas les envoyer) :
-- {
--   "idPlant": "<UUID_PLANT>",
--   "type": "humidite",
--   "name": "Capteur humidité salon"
-- }
-- ============================================================
