-- ============================================================
-- Migration 005 : Politiques RLS SELECT pour question et answer
-- ============================================================

-- SELECT question : l'utilisateur voit ses propres questions
CREATE POLICY "question_select_own"
  ON growlogic.question
  FOR SELECT
  TO authenticated
  USING ("IdUser" = auth.uid());

-- SELECT answer : l'utilisateur voit ses propres réponses
CREATE POLICY "answer_select_own"
  ON growlogic.answer
  FOR SELECT
  TO authenticated
  USING ("IdUser" = auth.uid());
