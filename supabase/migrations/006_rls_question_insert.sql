-- ============================================================
-- Migration 006 : Politique RLS INSERT pour question
-- ============================================================

-- INSERT question : l'utilisateur ne peut créer que ses propres questions
CREATE POLICY "question_insert_authenticated"
  ON growlogic.question
  FOR INSERT
  TO authenticated
  WITH CHECK ("IdUser" = auth.uid());
