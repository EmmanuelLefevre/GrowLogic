-- ============================================================
-- Migration 002 : RLS policies for plant routes
--   GET    /plant        → SELECT
--   POST   /plant        → INSERT
--   PATCH  /plant?id=eq. → UPDATE
--   DELETE /plant?id=eq. → DELETE
-- ============================================================

-- ============================================================
-- 1. Enable Row Level Security (RLS) on all 3 tables
--    Without RLS enabled, all queries bypass security checks
-- ============================================================
ALTER TABLE growlogic.plant    ENABLE ROW LEVEL SECURITY;
ALTER TABLE growlogic.question ENABLE ROW LEVEL SECURITY;
ALTER TABLE growlogic.answer   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. Trigger to automatically inject idUser = auth.uid()
--    on insert -> the client does not need to send idUser
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
-- 3. RLS Policy : INSERT on plant
--    Validate that idUser sent by the client = authenticated user
-- ============================================================
CREATE POLICY "plant_insert_authenticated"
  ON growlogic.plant
  FOR INSERT
  TO authenticated
  WITH CHECK ("idUser" = auth.uid());

-- ============================================================
-- 4. RLS Policies : SELECT / UPDATE / DELETE on plant
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
-- GET    https://<ref>.supabase.co/rest/v1/plant
-- POST   https://<ref>.supabase.co/rest/v1/plant
-- PATCH  https://<ref>.supabase.co/rest/v1/plant?id=eq.<UUID>
-- DELETE https://<ref>.supabase.co/rest/v1/plant?id=eq.<UUID>
--
-- Headers:
--   apikey: <SUPABASE_ANON_KEY>
--   Authorization: Bearer <TOKEN_JWT_USER>
--   Content-Type: application/json
--
-- POST Body (idUser and id are auto-generated, do not send them):
-- {
--   "name": "Monstera",
--   "mood": "happy",
--   "aiContext": {}
-- }
-- ============================================================
