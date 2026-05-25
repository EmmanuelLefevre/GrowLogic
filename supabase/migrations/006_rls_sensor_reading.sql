-- ============================================================
-- Migration 006 : RLS policies for sensor_reading routes
--   GET    /sensor_reading?idSensor=eq.<UUID> → SELECT
--   POST   /sensor_reading                    → INSERT
--   DELETE /sensor_reading?id=eq.<UUID>       → DELETE
--
-- NOTE : No UPDATE policy — sensor readings are immutable.
--        A reading is never edited, only created or deleted.
-- ============================================================

-- ============================================================
-- 1. Enable Row Level Security on sensor_reading table
-- ============================================================
ALTER TABLE growlogic.sensor_reading ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. RLS Policy : INSERT on sensor_reading
--    User can only create readings linked to their own account
-- ============================================================
CREATE POLICY "sensor_reading_insert_authenticated"
  ON growlogic.sensor_reading
  FOR INSERT
  TO authenticated
  WITH CHECK ("idUser" = auth.uid());

-- ============================================================
-- 3. RLS Policy : SELECT on sensor_reading
--    User can only see their own readings
-- ============================================================
CREATE POLICY "sensor_reading_select_own"
  ON growlogic.sensor_reading
  FOR SELECT
  TO authenticated
  USING ("idUser" = auth.uid());

-- ============================================================
-- 4. RLS Policy : DELETE on sensor_reading
--    User can only delete their own readings
-- ============================================================
CREATE POLICY "sensor_reading_delete_own"
  ON growlogic.sensor_reading
  FOR DELETE
  TO authenticated
  USING ("idUser" = auth.uid());

-- ============================================================
-- ENDPOINT USAGE (Angular / Client side)
-- ============================================================
-- POST readings:
-- POST https://<ref>.supabase.co/rest/v1/sensor_reading
--
-- GET all readings for a sensor:
-- GET  https://<ref>.supabase.co/rest/v1/sensor_reading?idSensor=eq.<UUID>
--
-- GET readings filtered by status:
-- GET  https://<ref>.supabase.co/rest/v1/sensor_reading?idSensor=eq.<UUID>&status=eq.critical
--
-- GET last N readings (ordered by date):
-- GET  https://<ref>.supabase.co/rest/v1/sensor_reading?idSensor=eq.<UUID>&order=createdAt.desc&limit=50
--
-- DELETE a reading:
-- DELETE https://<ref>.supabase.co/rest/v1/sensor_reading?id=eq.<UUID>
--
-- Headers:
--   apikey: <SUPABASE_ANON_KEY>
--   Authorization: Bearer <TOKEN_JWT_USER>
--   Content-Type: application/json
--   Prefer: return=representation
--
-- POST Body (idUser and id are auto-generated, do not send them):
-- {
--   "idSensor": "<UUID_SENSOR>",
--   "value": 22.50,
--   "unit": "°C",
--   "status": "optimal"
-- }
-- ============================================================
