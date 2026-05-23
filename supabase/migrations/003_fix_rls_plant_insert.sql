-- ============================================================
-- Migration 003 : Correction politique INSERT plant
-- On valide que IdUser envoyé par le client = l'utilisateur connecté
-- Le trigger set_user_id n'est plus nécessaire pour l'insert
-- ============================================================

DROP POLICY IF EXISTS "plant_insert_authenticated" ON growlogic.plant;

CREATE POLICY "plant_insert_authenticated"
  ON growlogic.plant
  FOR INSERT
  TO authenticated
  WITH CHECK ("IdUser" = auth.uid());
