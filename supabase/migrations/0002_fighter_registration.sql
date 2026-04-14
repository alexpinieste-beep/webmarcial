-- ============================================================
-- 0002: Registro individual de luchadores + nivel de competición
-- ============================================================

-- Permite a cada luchador ser propietario de su propio perfil
ALTER TABLE fighters ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- Nivel de competición: amateur o profesional
ALTER TABLE fighters ADD COLUMN IF NOT EXISTS level text NOT NULL DEFAULT 'amateur'
  CONSTRAINT fighters_level_check CHECK (level IN ('amateur', 'professional'));

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS fighters_owner_id_idx ON fighters(owner_id);
CREATE INDEX IF NOT EXISTS fighters_level_idx ON fighters(level);

-- ── RLS policies para propietarios de perfiles ──────────────────────
-- Un luchador autenticado puede insertar su propio perfil
CREATE POLICY "fighters_owner_can_insert" ON fighters
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Un luchador autenticado puede actualizar solo su propio perfil
CREATE POLICY "fighters_owner_can_update" ON fighters
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Un luchador autenticado puede eliminar solo su propio perfil
CREATE POLICY "fighters_owner_can_delete" ON fighters
  FOR DELETE
  USING (auth.uid() = owner_id);
