-- ============================================================
-- Migration 002 : RLS + endpoint POST /plant (créer une plante)
-- ============================================================

-- ============================================================
-- 1. Activation du Row Level Security sur les 3 tables
--    Sans RLS activé, toutes les requêtes passent sans contrôle
-- ============================================================
ALTER TABLE growlogic.plant    ENABLE ROW LEVEL SECURITY;
ALTER TABLE growlogic.question ENABLE ROW LEVEL SECURITY;
ALTER TABLE growlogic.answer   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. Trigger pour injecter automatiquement IdUser = auth.uid()
--    à l'insertion → le client n'a pas besoin d'envoyer IdUser
-- ============================================================
CREATE OR REPLACE FUNCTION growlogic.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW."IdUser" = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_plant_set_user_id
  BEFORE INSERT ON growlogic.plant
  FOR EACH ROW
  EXECUTE FUNCTION growlogic.set_user_id();

-- ============================================================
-- 3. Politique RLS : INSERT sur plant
--    Condition : l'utilisateur doit être connecté (auth.uid() non null)
--    Le IdUser de la ligne insérée doit correspondre au user connecté
-- ============================================================
CREATE POLICY "plant_insert_authenticated"
  ON growlogic.plant
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 4. Politiques RLS : SELECT / UPDATE / DELETE sur plant
--    Un user ne peut voir et modifier que SES propres plantes
-- ============================================================
CREATE POLICY "plant_select_own"
  ON growlogic.plant
  FOR SELECT
  TO authenticated
  USING ("IdUser" = auth.uid());

CREATE POLICY "plant_update_own"
  ON growlogic.plant
  FOR UPDATE
  TO authenticated
  USING ("IdUser" = auth.uid())
  WITH CHECK ("IdUser" = auth.uid());

CREATE POLICY "plant_delete_own"
  ON growlogic.plant
  FOR DELETE
  TO authenticated
  USING ("IdUser" = auth.uid());

-- ============================================================
-- UTILISATION DE L'ENDPOINT (côté Angular / client)
-- ============================================================
-- POST https://<ref>.supabase.co/rest/v1/plant
-- Headers:
--   apikey: <SUPABASE_ANON_KEY>
--   Authorization: Bearer <TOKEN_JWT_USER>
--   Content-Type: application/json
--
-- Body (IdUser et IdPlant sont auto-générés, ne pas les envoyer) :
-- {
--   "name": "Monstera",
--   "mood": "happy",
--   "AiContext": {}
-- }
-- ============================================================
