-- ============================================================
-- Migration 007 : View for latest sensor reading per sensor
--
-- Returns the most recent reading for each sensor, enriched
-- with the sensor's idPlant and type for direct plant-level
-- queries without extra JOINs on the client side.
--
-- security_invoker = true → the view respects the RLS policies
-- of the calling user (sensor_reading idUser = auth.uid())
-- ============================================================

CREATE VIEW growlogic.latest_sensor_reading
WITH (security_invoker = true)
AS
SELECT DISTINCT ON (sr."idSensor")
  sr.id,
  sr."idSensor",
  sr."idUser",
  sr.value,
  sr.unit,
  sr.status,
  sr."createdAt",
  s."idPlant",
  s.type        AS "sensorType"
FROM growlogic.sensor_reading  sr
INNER JOIN growlogic.sensor    s  ON s.id = sr."idSensor"
ORDER BY sr."idSensor", sr."createdAt" DESC;

-- Allow authenticated users to query the view
GRANT SELECT ON growlogic.latest_sensor_reading TO authenticated;

-- ============================================================
-- ENDPOINT USAGE (Angular / Client side)
-- ============================================================
-- GET all latest readings for the current user:
-- GET https://<ref>.supabase.co/rest/v1/latest_sensor_reading
--
-- GET latest readings for a specific plant:
-- GET https://<ref>.supabase.co/rest/v1/latest_sensor_reading?idPlant=eq.<UUID>
--
-- Headers:
--   apikey: <SUPABASE_ANON_KEY>
--   Authorization: Bearer <TOKEN_JWT_USER>
-- ============================================================
