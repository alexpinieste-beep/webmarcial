-- =============================================================================
-- WebMarcial — Initial Schema
-- Migration: 0001_initial_schema.sql
-- Description: Full initial schema for the WebMarcial combat sports platform
-- =============================================================================

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

CREATE TYPE gender_enum AS ENUM ('male', 'female', 'open');
CREATE TYPE role_enum AS ENUM ('admin', 'gym_owner', 'public');
CREATE TYPE subscription_tier_enum AS ENUM ('free', 'basic', 'pro');
CREATE TYPE event_status_enum AS ENUM ('draft', 'published', 'completed', 'cancelled');
CREATE TYPE fight_result_enum AS ENUM ('pending', 'fighter_a_win', 'fighter_b_win', 'draw', 'no_contest');
CREATE TYPE lead_status_enum AS ENUM ('new', 'contacted', 'converted', 'closed');

-- ---------------------------------------------------------------------------
-- TABLE: sports
-- ---------------------------------------------------------------------------

CREATE TABLE sports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text,
  image_url   text,
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE: weight_classes
-- ---------------------------------------------------------------------------

CREATE TABLE weight_classes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id       uuid NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  name           text NOT NULL,
  slug           text NOT NULL,
  min_weight_kg  numeric,
  max_weight_kg  numeric,
  gender         gender_enum NOT NULL DEFAULT 'open',
  created_at     timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE: zones  (Comunidades Autónomas + Ceuta + Melilla)
-- ---------------------------------------------------------------------------

CREATE TABLE zones (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  slug       text NOT NULL UNIQUE,
  code       char(2) NOT NULL,
  capital    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE: profiles  (linked 1:1 to auth.users)
-- ---------------------------------------------------------------------------

CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        role_enum NOT NULL DEFAULT 'public',
  full_name   text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT NOW(),
  updated_at  timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- HELPER FUNCTION: is_admin()
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---------------------------------------------------------------------------
-- TRIGGER: auto-create profile on new auth.users row
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, role)
  VALUES (NEW.id, 'public')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------------------
-- TABLE: gyms
-- ---------------------------------------------------------------------------

CREATE TABLE gyms (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id                uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  name                    text NOT NULL,
  slug                    text NOT NULL UNIQUE,
  description             text,
  address                 text,
  zone_id                 uuid REFERENCES zones(id) ON DELETE SET NULL,
  phone                   text,
  email                   text,
  website                 text,
  instagram               text,
  facebook                text,
  sport_ids               uuid[],
  subscription_tier       subscription_tier_enum NOT NULL DEFAULT 'free',
  subscription_expires_at timestamptz,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  is_verified             boolean NOT NULL DEFAULT false,
  is_featured             boolean NOT NULL DEFAULT false,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  updated_at              timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE: gym_images
-- ---------------------------------------------------------------------------

CREATE TABLE gym_images (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id     uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  url        text NOT NULL,
  caption    text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE: fighters
-- ---------------------------------------------------------------------------

CREATE TABLE fighters (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id      uuid REFERENCES gyms(id) ON DELETE SET NULL,
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  bio         text,
  avatar_url  text,
  nationality char(2) NOT NULL DEFAULT 'ES',
  is_verified boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT NOW(),
  updated_at  timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE: fighter_sport_profiles
-- ---------------------------------------------------------------------------

CREATE TABLE fighter_sport_profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fighter_id      uuid NOT NULL REFERENCES fighters(id) ON DELETE CASCADE,
  sport_id        uuid NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  weight_class_id uuid NOT NULL REFERENCES weight_classes(id) ON DELETE RESTRICT,
  wins            int NOT NULL DEFAULT 0,
  losses          int NOT NULL DEFAULT 0,
  draws           int NOT NULL DEFAULT 0,
  no_contests     int NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE: titles
-- ---------------------------------------------------------------------------

CREATE TABLE titles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  sport_id        uuid NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  weight_class_id uuid NOT NULL REFERENCES weight_classes(id) ON DELETE RESTRICT,
  zone_id         uuid REFERENCES zones(id) ON DELETE SET NULL,  -- NULL = nacional
  organization    text NOT NULL,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE: fighter_titles
-- ---------------------------------------------------------------------------

CREATE TABLE fighter_titles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fighter_id uuid NOT NULL REFERENCES fighters(id) ON DELETE CASCADE,
  title_id   uuid NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  won_at     date NOT NULL,
  lost_at    date,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE: rankings
-- ---------------------------------------------------------------------------

CREATE TABLE rankings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fighter_id      uuid NOT NULL REFERENCES fighters(id) ON DELETE CASCADE,
  sport_id        uuid NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  weight_class_id uuid NOT NULL REFERENCES weight_classes(id) ON DELETE RESTRICT,
  zone_id         uuid REFERENCES zones(id) ON DELETE SET NULL,  -- NULL = nacional
  position        int NOT NULL,
  points          int NOT NULL DEFAULT 0,
  season          int NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT NOW(),
  updated_at      timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE: events
-- ---------------------------------------------------------------------------

CREATE TABLE events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  slug        text NOT NULL UNIQUE,
  sport_id    uuid NOT NULL REFERENCES sports(id) ON DELETE RESTRICT,
  zone_id     uuid REFERENCES zones(id) ON DELETE SET NULL,
  venue       text,
  address     text,
  event_date  timestamptz NOT NULL,
  description text,
  poster_url  text,
  status      event_status_enum NOT NULL DEFAULT 'draft',
  created_at  timestamptz NOT NULL DEFAULT NOW(),
  updated_at  timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE: fights
-- ---------------------------------------------------------------------------

CREATE TABLE fights (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  fighter_a_id    uuid NOT NULL REFERENCES fighters(id) ON DELETE RESTRICT,
  fighter_b_id    uuid NOT NULL REFERENCES fighters(id) ON DELETE RESTRICT,
  weight_class_id uuid NOT NULL REFERENCES weight_classes(id) ON DELETE RESTRICT,
  result          fight_result_enum NOT NULL DEFAULT 'pending',
  method          text,
  round           int,
  time            text,
  sort_order      int NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE: leads
-- ---------------------------------------------------------------------------

CREATE TABLE leads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id     uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name       text NOT NULL,
  email      text NOT NULL,
  phone      text,
  message    text,
  status     lead_status_enum NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE: subscription_plans
-- ---------------------------------------------------------------------------

CREATE TABLE subscription_plans (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name               text NOT NULL,
  tier               subscription_tier_enum NOT NULL,
  price_monthly_eur  numeric NOT NULL,
  stripe_price_id    text,
  features           jsonb,
  created_at         timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE: subscription_events
-- ---------------------------------------------------------------------------

CREATE TABLE subscription_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id           uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  stripe_event_id  text NOT NULL UNIQUE,
  event_type       text NOT NULL,
  payload          jsonb,
  processed_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE sports               ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_classes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones                ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE gyms                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_images           ENABLE ROW LEVEL SECURITY;
ALTER TABLE fighters             ENABLE ROW LEVEL SECURITY;
ALTER TABLE fighter_sport_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE titles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE fighter_titles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE events               ENABLE ROW LEVEL SECURITY;
ALTER TABLE fights               ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads                ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans   ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events  ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- POLICIES: Public read-only tables
-- ---------------------------------------------------------------------------

CREATE POLICY "public_read_sports"
  ON sports FOR SELECT USING (true);

CREATE POLICY "public_read_weight_classes"
  ON weight_classes FOR SELECT USING (true);

CREATE POLICY "public_read_zones"
  ON zones FOR SELECT USING (true);

CREATE POLICY "public_read_gyms"
  ON gyms FOR SELECT USING (is_verified = true);

CREATE POLICY "public_read_fighters"
  ON fighters FOR SELECT USING (is_verified = true);

CREATE POLICY "public_read_rankings"
  ON rankings FOR SELECT USING (true);

CREATE POLICY "public_read_events"
  ON events FOR SELECT USING (status = 'published');

CREATE POLICY "public_read_fights"
  ON fights FOR SELECT USING (true);

CREATE POLICY "public_read_titles"
  ON titles FOR SELECT USING (true);

CREATE POLICY "public_read_fighter_titles"
  ON fighter_titles FOR SELECT USING (true);

CREATE POLICY "public_read_subscription_plans"
  ON subscription_plans FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- POLICIES: gym_owner — gyms
-- ---------------------------------------------------------------------------

CREATE POLICY "gym_owner_select_own_gym"
  ON gyms FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "gym_owner_insert_gym"
  ON gyms FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "gym_owner_update_own_gym"
  ON gyms FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "gym_owner_delete_own_gym"
  ON gyms FOR DELETE
  USING (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- POLICIES: gym_owner — leads (read-only for own gyms)
-- ---------------------------------------------------------------------------

CREATE POLICY "gym_owner_select_own_leads"
  ON leads FOR SELECT
  USING (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- POLICIES: gym_owner — fighters (insert/update for own gyms)
-- ---------------------------------------------------------------------------

CREATE POLICY "gym_owner_insert_fighters"
  ON fighters FOR INSERT
  WITH CHECK (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "gym_owner_update_fighters"
  ON fighters FOR UPDATE
  USING (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- POLICIES: admin — full access to all tables
-- ---------------------------------------------------------------------------

CREATE POLICY "admin_all_sports"
  ON sports FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_weight_classes"
  ON weight_classes FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_zones"
  ON zones FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_profiles"
  ON profiles FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_gyms"
  ON gyms FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_gym_images"
  ON gym_images FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_fighters"
  ON fighters FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_fighter_sport_profiles"
  ON fighter_sport_profiles FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_titles"
  ON titles FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_fighter_titles"
  ON fighter_titles FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_rankings"
  ON rankings FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_events"
  ON events FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_fights"
  ON fights FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_leads"
  ON leads FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_subscription_plans"
  ON subscription_plans FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_subscription_events"
  ON subscription_events FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- POLICY: profiles — each user can read/update their own profile
-- ---------------------------------------------------------------------------

CREATE POLICY "user_select_own_profile"
  ON profiles FOR SELECT USING (id = auth.uid());

CREATE POLICY "user_update_own_profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Sports (6)
-- ---------------------------------------------------------------------------

INSERT INTO sports (name, slug) VALUES
  ('Muay Thai',              'muay-thai'),
  ('Kickboxing',             'kickboxing'),
  ('K1',                     'k1'),
  ('MMA',                    'mma'),
  ('Boxeo',                  'boxeo'),
  ('Jiu-Jitsu / Grappling',  'jiu-jitsu')
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Zones — 19 Comunidades Autónomas + Ceuta + Melilla
-- ---------------------------------------------------------------------------

INSERT INTO zones (name, slug, code, capital) VALUES
  ('Andalucía',              'andalucia',              'AN', 'Sevilla'),
  ('Aragón',                 'aragon',                 'AR', 'Zaragoza'),
  ('Asturias',               'asturias',               'AS', 'Oviedo'),
  ('Baleares',               'baleares',               'IB', 'Palma'),
  ('Canarias',               'canarias',               'CN', 'Las Palmas'),
  ('Cantabria',              'cantabria',              'CB', 'Santander'),
  ('Castilla-La Mancha',     'castilla-la-mancha',     'CM', 'Toledo'),
  ('Castilla y León',        'castilla-y-leon',        'CL', 'Valladolid'),
  ('Cataluña',               'cataluna',               'CT', 'Barcelona'),
  ('Extremadura',            'extremadura',            'EX', 'Mérida'),
  ('Galicia',                'galicia',                'GA', 'Santiago de Compostela'),
  ('La Rioja',               'la-rioja',               'RI', 'Logroño'),
  ('Madrid',                 'madrid',                 'MD', 'Madrid'),
  ('Murcia',                 'murcia',                 'MU', 'Murcia'),
  ('Navarra',                'navarra',                'NC', 'Pamplona'),
  ('País Vasco',             'pais-vasco',             'PV', 'Vitoria-Gasteiz'),
  ('Valencia',               'valencia',               'VC', 'Valencia'),
  ('Ceuta',                  'ceuta',                  'CE', 'Ceuta'),
  ('Melilla',                'melilla',                'ML', 'Melilla')
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Subscription plans (3)
-- ---------------------------------------------------------------------------

INSERT INTO subscription_plans (name, tier, price_monthly_eur, features) VALUES
  ('Free',  'free',  0,  '{"max_images": 3,  "featured": false, "analytics": false}'::jsonb),
  ('Basic', 'basic', 29, '{"max_images": 10, "featured": false, "analytics": true}'::jsonb),
  ('Pro',   'pro',   79, '{"max_images": 50, "featured": true,  "analytics": true}'::jsonb)
ON CONFLICT DO NOTHING;
