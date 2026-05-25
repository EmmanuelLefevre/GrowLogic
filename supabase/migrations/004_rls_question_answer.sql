-- ============================================================
-- Migration 004 : RLS policies for question & answer routes
--   GET  /question       → SELECT
--   POST /question       → INSERT
--   GET  /answer         → SELECT
-- ============================================================

-- ============================================================
-- QUESTION
-- ============================================================

-- SELECT question : User can only see their own questions
CREATE POLICY "question_select_own"
  ON growlogic.question
  FOR SELECT
  TO authenticated
  USING ("idUser" = auth.uid());

-- INSERT question : User can only create their own questions
CREATE POLICY "question_insert_authenticated"
  ON growlogic.question
  FOR INSERT
  TO authenticated
  WITH CHECK ("idUser" = auth.uid());

-- UPDATE question : User can only update their own questions
CREATE POLICY "question_update_own"
  ON growlogic.question
  FOR UPDATE
  TO authenticated
  USING ("idUser" = auth.uid())
  WITH CHECK ("idUser" = auth.uid());

-- DELETE question : User can only delete their own questions
CREATE POLICY "question_delete_own"
  ON growlogic.question
  FOR DELETE
  TO authenticated
  USING ("idUser" = auth.uid());

-- ============================================================
-- ANSWER
-- ============================================================

-- SELECT answer : User can only see their own answers
CREATE POLICY "answer_select_own"
  ON growlogic.answer
  FOR SELECT
  TO authenticated
  USING ("idUser" = auth.uid());

-- INSERT answer : User can only create their own answers
CREATE POLICY "answer_insert_authenticated"
  ON growlogic.answer
  FOR INSERT
  TO authenticated
  WITH CHECK ("idUser" = auth.uid());

-- UPDATE answer : User can only update their own answers
CREATE POLICY "answer_update_own"
  ON growlogic.answer
  FOR UPDATE
  TO authenticated
  USING ("idUser" = auth.uid())
  WITH CHECK ("idUser" = auth.uid());

-- DELETE answer : User can only delete their own answers
CREATE POLICY "answer_delete_own"
  ON growlogic.answer
  FOR DELETE
  TO authenticated
  USING ("idUser" = auth.uid());

-- ============================================================
-- ENDPOINT USAGE (Angular / Client side)
-- ============================================================
-- GET    https://<ref>.supabase.co/rest/v1/question
-- POST   https://<ref>.supabase.co/rest/v1/question
-- PATCH  https://<ref>.supabase.co/rest/v1/question?id=eq.<UUID>
-- DELETE https://<ref>.supabase.co/rest/v1/question?id=eq.<UUID>
--
-- GET    https://<ref>.supabase.co/rest/v1/answer
-- POST   https://<ref>.supabase.co/rest/v1/answer
-- PATCH  https://<ref>.supabase.co/rest/v1/answer?id=eq.<UUID>
-- DELETE https://<ref>.supabase.co/rest/v1/answer?id=eq.<UUID>
--
-- Headers:
--   apikey: <SUPABASE_ANON_KEY>
--   Authorization: Bearer <TOKEN_JWT_USER>
--   Content-Type: application/json
--
-- POST Body for question (idUser and id are auto-generated):
-- {
--   "content": "Comment arroser mon Monstera ?",
--   "idPlant": "<UUID_PLANT>"
-- }
--
-- POST Body for answer (idUser and id are auto-generated):
-- {
--   "content": "Arrose-le une fois par semaine.",
--   "idQuestion": "<UUID_QUESTION>"
-- }
-- ============================================================
