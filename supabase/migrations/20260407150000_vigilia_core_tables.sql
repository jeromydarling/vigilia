-- Vigilia Core Tables — Catholic Senior Care Hospitality Layer
-- Adds visit rituals, pastoral care, family extensions, drift detection,
-- volunteer coordination, and HIPAA audit logging.

-- ══════════════════════════════════════════════════════════════
-- 1. Extend contacts for residents
-- ══════════════════════════════════════════════════════════════

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS care_level text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS faith_tradition text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS parish_affiliation text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS room_number text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS admission_date date;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS preferred_name text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS dietary_notes text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS mobility_notes text;

-- Extend household members for family circle
ALTER TABLE contact_household_members ADD COLUMN IF NOT EXISTS communication_preference text;
ALTER TABLE contact_household_members ADD COLUMN IF NOT EXISTS is_emergency_contact boolean DEFAULT false;
ALTER TABLE contact_household_members ADD COLUMN IF NOT EXISTS contact_frequency_preference text;
ALTER TABLE contact_household_members ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz;

-- ══════════════════════════════════════════════════════════════
-- 2. Voice Prompts (rotating Ignatian formation prompts)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS voice_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN (
    'surprise', 'face', 'family', 'spiritual', 'memory',
    'joy', 'loss', 'daily_life', 'accompaniment'
  )),
  prompt_text text NOT NULL,
  best_when text,
  liturgical_affinity text,
  active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- 3. Visit Rituals (the 30-second bedside capture)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS visit_rituals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  resident_contact_id uuid NOT NULL REFERENCES contacts(id),
  visitor_user_id uuid NOT NULL REFERENCES auth.users(id),
  visited_at timestamptz NOT NULL DEFAULT now(),
  mood_observed text NOT NULL CHECK (mood_observed IN (
    'peaceful', 'lonely', 'anxious', 'encouraged', 'tired', 'hard_to_tell'
  )),
  need_observed text NOT NULL CHECK (need_observed IN (
    'company', 'prayer', 'family_contact', 'sacramental_care', 'comfort', 'staff_followup'
  )),
  concern_noted text NOT NULL CHECK (concern_noted IN (
    'new_grief', 'withdrawal', 'joyful_moment', 'family_strain', 'spiritual_request', 'no_concern'
  )),
  followup_action text NOT NULL CHECK (followup_action IN (
    'tell_chaplain', 'contact_family', 'ask_volunteer_visit', 'no_followup'
  )),
  voice_note_url text,
  voice_prompt_id text,
  voice_prompt_text text,
  duration_seconds int,
  facility_anchor_id uuid REFERENCES anchors(id),
  is_hipaa_sensitive boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visit_rituals_tenant_resident
  ON visit_rituals(tenant_id, resident_contact_id, visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visit_rituals_visitor
  ON visit_rituals(visitor_user_id, visited_at DESC);

-- ══════════════════════════════════════════════════════════════
-- 4. Resident Faith History
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS resident_faith_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  resident_contact_id uuid NOT NULL REFERENCES contacts(id),
  event_type text NOT NULL CHECK (event_type IN (
    'baptism', 'first_communion', 'confirmation', 'marriage',
    'ordination', 'conversion', 'religious_vows', 'other'
  )),
  event_date date,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- 5. Resident Losses & Joys
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS resident_losses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  resident_contact_id uuid NOT NULL REFERENCES contacts(id),
  loss_type text NOT NULL,
  person_name text,
  relationship text,
  date_of_loss date,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resident_joys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  resident_contact_id uuid NOT NULL REFERENCES contacts(id),
  joy_type text NOT NULL,
  description text NOT NULL,
  observed_date date,
  reported_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- 6. Sacramental Records (Pastoral Care)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sacramental_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  resident_contact_id uuid NOT NULL REFERENCES contacts(id),
  sacrament_type text NOT NULL CHECK (sacrament_type IN (
    'communion', 'confession', 'anointing_of_sick', 'last_rites',
    'rosary', 'blessing', 'other'
  )),
  administered_by text,
  administered_at timestamptz NOT NULL DEFAULT now(),
  location text,
  notes text,
  next_scheduled timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sacramental_records_resident
  ON sacramental_records(tenant_id, resident_contact_id, administered_at DESC);

-- ══════════════════════════════════════════════════════════════
-- 7. Chaplain Assignments
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS chaplain_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  facility_anchor_id uuid NOT NULL REFERENCES anchors(id),
  chaplain_user_id uuid NOT NULL REFERENCES auth.users(id),
  assignment_type text DEFAULT 'primary',
  schedule_json jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- 8. Family Strain Signals
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS family_strain_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  resident_contact_id uuid NOT NULL REFERENCES contacts(id),
  family_relationship_id uuid,
  signal_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  observed_at timestamptz NOT NULL DEFAULT now(),
  observed_by uuid REFERENCES auth.users(id),
  notes text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- 9. Loneliness Scores (Drift & Loneliness Watch)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS loneliness_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  resident_contact_id uuid NOT NULL REFERENCES contacts(id),
  score_date date NOT NULL,
  isolation_score int NOT NULL CHECK (isolation_score BETWEEN 0 AND 100),
  visit_frequency_7d int DEFAULT 0,
  visit_frequency_30d int DEFAULT 0,
  family_contact_frequency int DEFAULT 0,
  mood_trend_7d text,
  contributing_factors jsonb DEFAULT '{}',
  drift_status text DEFAULT 'present' CHECK (drift_status IN ('present', 'quiet', 'drifting', 'distant')),
  computed_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_loneliness_scores_unique
  ON loneliness_scores(tenant_id, resident_contact_id, score_date);

-- ══════════════════════════════════════════════════════════════
-- 10. Eucharistic Minister Schedules
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS eucharistic_minister_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  volunteer_contact_id uuid NOT NULL REFERENCES contacts(id),
  facility_anchor_id uuid NOT NULL REFERENCES anchors(id),
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  time_slot text DEFAULT 'morning',
  resident_assignments jsonb DEFAULT '[]',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- 11. Parish–Facility Links
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS parish_facility_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  parish_name text NOT NULL,
  parish_territory_id uuid,
  facility_anchor_id uuid NOT NULL REFERENCES anchors(id),
  relationship_type text DEFAULT 'primary_parish',
  created_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- 12. PHI Access Log (HIPAA Audit Trail)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS phi_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('view', 'create', 'update', 'delete', 'export')),
  accessed_at timestamptz DEFAULT now(),
  ip_address inet
);

CREATE INDEX IF NOT EXISTS idx_phi_access_log_tenant
  ON phi_access_log(tenant_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_phi_access_log_resource
  ON phi_access_log(resource_type, resource_id);

-- ══════════════════════════════════════════════════════════════
-- 13. RLS Policies
-- ══════════════════════════════════════════════════════════════

ALTER TABLE visit_rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_faith_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_losses ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_joys ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacramental_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE chaplain_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_strain_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE loneliness_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE eucharistic_minister_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE parish_facility_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE phi_access_log ENABLE ROW LEVEL SECURITY;

-- Tenant-scoped read for authenticated users
CREATE POLICY "tenant_read" ON visit_rituals FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "tenant_insert" ON visit_rituals FOR INSERT WITH CHECK (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "tenant_read" ON sacramental_records FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "tenant_insert" ON sacramental_records FOR INSERT WITH CHECK (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "tenant_read" ON loneliness_scores FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "tenant_read" ON resident_faith_history FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "tenant_insert" ON resident_faith_history FOR INSERT WITH CHECK (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "tenant_read" ON resident_losses FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "tenant_read" ON resident_joys FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "tenant_read" ON family_strain_signals FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "tenant_read" ON chaplain_assignments FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "tenant_read" ON eucharistic_minister_schedules FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "tenant_read" ON parish_facility_links FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "own_log_read" ON phi_access_log FOR SELECT USING (
  user_id = auth.uid()
);
