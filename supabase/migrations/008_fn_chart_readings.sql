-- ============================================================
-- Migration 008 : RPC function get_chart_readings
--
-- Returns aggregated sensor readings (avg per bucket) for a
-- given plant and time period, filtered to the calling user.
--
-- Aggregation granularity:
--   'day'   → by hour   (~24 points)
--   'week'  → by hour   (~168 points)
--   'month' → by day    (~30 points)
--
-- SECURITY DEFINER + auth.uid() check = no separate RLS needed.
-- ============================================================

CREATE OR REPLACE FUNCTION growlogic.get_chart_readings(
  p_id_plant UUID,
  p_period   TEXT   -- 'day' | 'week' | 'month'
)
RETURNS TABLE (
  bucket       TIMESTAMPTZ,
  sensor_type  TEXT,
  avg_value    NUMERIC,
  unit         TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    date_trunc(
      CASE p_period
        WHEN 'day'   THEN 'hour'
        WHEN 'week'  THEN 'hour'
        WHEN 'month' THEN 'day'
      END,
      sr."createdAt"
    )                               AS bucket,
    s.type::TEXT                    AS sensor_type,
    ROUND(AVG(sr.value)::NUMERIC, 1) AS avg_value,
    MAX(sr.unit)                    AS unit
  FROM growlogic.sensor_reading sr
  INNER JOIN growlogic.sensor s ON s.id = sr."idSensor"
  WHERE
    s."idPlant"    = p_id_plant
    AND sr."idUser" = auth.uid()
    AND sr."createdAt" >= NOW() - (
      CASE p_period
        WHEN 'day'   THEN INTERVAL '1 day'
        WHEN 'week'  THEN INTERVAL '7 days'
        WHEN 'month' THEN INTERVAL '30 days'
      END
    )
  GROUP BY bucket, s.type
  ORDER BY bucket ASC;
$$;

-- Allow authenticated users to call this function
GRANT EXECUTE ON FUNCTION growlogic.get_chart_readings(UUID, TEXT) TO authenticated;

-- ============================================================
-- ENDPOINT USAGE (Angular / Client side)
-- ============================================================
-- POST https://<ref>.supabase.co/rest/v1/rpc/get_chart_readings
-- Body: { "p_id_plant": "<UUID>", "p_period": "week" }
--
-- Headers:
--   apikey: <SUPABASE_ANON_KEY>
--   Authorization: Bearer <TOKEN_JWT_USER>
--   Content-Type: application/json
-- ============================================================
