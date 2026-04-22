-- ============================================================
-- 0003: RLS fixes
--   1. gym_images — public read + gym owner read/write
--   2. fighters — gym owners can SELECT their own (unverified) fighters
--   3. fighters — insert policy extended to cover NULL owner_id
--   4. fighter_sport_profiles — gym owner + fighter owner policies
-- ============================================================

-- ── 1. gym_images ────────────────────────────────────────────
-- Previously only admin_all_gym_images existed; no public read.

CREATE POLICY "public_read_gym_images"
  ON gym_images FOR SELECT
  USING (
    gym_id IN (SELECT id FROM gyms WHERE is_verified = true)
  );

CREATE POLICY "gym_owner_read_gym_images"
  ON gym_images FOR SELECT
  USING (
    gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
  );

CREATE POLICY "gym_owner_insert_gym_images"
  ON gym_images FOR INSERT
  WITH CHECK (
    gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
  );

CREATE POLICY "gym_owner_delete_gym_images"
  ON gym_images FOR DELETE
  USING (
    gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
  );

-- ── 2. fighters — gym owner SELECT ───────────────────────────
-- Without this, gym owners can INSERT fighters but then cannot
-- READ them back (public_read_fighters requires is_verified=true).
-- This breaks the dashboard list AND updateFighter/deleteFighter
-- because verifyFighterOwnership can't find the fighter row.

CREATE POLICY "gym_owner_select_fighters"
  ON fighters FOR SELECT
  USING (
    gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
  );

-- Fighter owners can always read their own profile
CREATE POLICY "fighter_owner_select_fighter"
  ON fighters FOR SELECT
  USING (owner_id = auth.uid());

-- ── 3. fighters — insert policy fix ──────────────────────────
-- fighters_owner_can_insert (from 0002) checks auth.uid()=owner_id
-- but gym-created fighters have owner_id=NULL → RLS rejects.
-- gym_owner_insert_fighters (from 0001) already covers this, but
-- we drop+recreate fighters_owner_can_insert to avoid ambiguity.

DROP POLICY IF EXISTS "fighters_owner_can_insert" ON fighters;

CREATE POLICY "fighters_owner_can_insert" ON fighters
  FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    OR
    gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
  );

-- ── 4. fighter_sport_profiles ─────────────────────────────────
-- Only admin_all_fighter_sport_profiles existed (from 0001).
-- Gym owners and fighter self-owners need read+write access.

CREATE POLICY "public_read_fighter_sport_profiles"
  ON fighter_sport_profiles FOR SELECT
  USING (true);

CREATE POLICY "gym_owner_manage_sport_profiles"
  ON fighter_sport_profiles FOR ALL
  USING (
    fighter_id IN (
      SELECT f.id FROM fighters f
      INNER JOIN gyms g ON g.id = f.gym_id
      WHERE g.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    fighter_id IN (
      SELECT f.id FROM fighters f
      INNER JOIN gyms g ON g.id = f.gym_id
      WHERE g.owner_id = auth.uid()
    )
  );

CREATE POLICY "fighter_owner_manage_sport_profiles"
  ON fighter_sport_profiles FOR ALL
  USING (
    fighter_id IN (
      SELECT id FROM fighters WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    fighter_id IN (
      SELECT id FROM fighters WHERE owner_id = auth.uid()
    )
  );
