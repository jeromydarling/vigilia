-- Vigilia Phase 2 Tables — Narrative Synthesis, Family Portal, Print Jobs
-- Adds family reflections, weekly chapters, print jobs, and family accounts.

-- ══════════════════════════════════════════════════════════════
-- 1. Family Reflections (AI-synthesized narrative entries)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS family_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  resident_contact_id uuid NOT NULL REFERENCES contacts(id),
  season text NOT NULL, -- 'advent', 'christmas', 'lent', 'easter', etc.
  reflection_text text NOT NULL,
  reflection_type text NOT NULL DEFAULT 'daily' CHECK (reflection_type IN ('immediate', 'daily', 'weekly')),
  source_visit_ids uuid[] DEFAULT '{}',
  is_print_candidate boolean DEFAULT false,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_family_reflections_resident_season
  ON family_reflections(tenant_id, resident_contact_id, season, published_at DESC);

-- ══════════════════════════════════════════════════════════════
-- 2. Weekly Chapters (composed from daily reflections)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS weekly_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  resident_contact_id uuid NOT NULL REFERENCES contacts(id),
  week_start date NOT NULL,
  chapter_text text NOT NULL,
  source_reflection_ids uuid[] DEFAULT '{}',
  season text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_chapters_unique
  ON weekly_chapters(tenant_id, resident_contact_id, week_start);

-- ══════════════════════════════════════════════════════════════
-- 3. Print Jobs (Lulu API order tracking)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS print_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  resident_contact_id uuid NOT NULL REFERENCES contacts(id),
  season text NOT NULL,
  season_year int NOT NULL,
  pdf_url text,
  lulu_order_id text,
  status text DEFAULT 'pending' CHECK (status IN (
    'pending', 'generating_pdf', 'pdf_ready', 'submitted_to_lulu',
    'printing', 'shipped', 'delivered', 'failed', 'cancelled'
  )),
  shipped_at timestamptz,
  tracking_url text,
  shipping_address jsonb,
  cost_cents int,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_print_jobs_resident
  ON print_jobs(tenant_id, resident_contact_id, season_year DESC);

-- ══════════════════════════════════════════════════════════════
-- 4. Family Accounts (family members with auth access)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS family_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  resident_contact_id uuid NOT NULL REFERENCES contacts(id),
  relationship text, -- 'daughter', 'son', 'spouse', 'grandchild', etc.
  is_primary boolean DEFAULT false,
  invite_token text,
  invite_accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_family_accounts_unique
  ON family_accounts(user_id, resident_contact_id);

-- ══════════════════════════════════════════════════════════════
-- 5. RLS Policies
-- ══════════════════════════════════════════════════════════════

ALTER TABLE family_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_accounts ENABLE ROW LEVEL SECURITY;

-- Staff can read/write reflections for their tenant
CREATE POLICY "tenant_read" ON family_reflections FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "tenant_insert" ON family_reflections FOR INSERT WITH CHECK (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- Family members can read reflections for their linked resident
CREATE POLICY "family_read" ON family_reflections FOR SELECT USING (
  resident_contact_id IN (
    SELECT resident_contact_id FROM family_accounts WHERE user_id = auth.uid()
  )
);

-- Staff can read weekly chapters
CREATE POLICY "tenant_read" ON weekly_chapters FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- Family can read weekly chapters for their resident
CREATE POLICY "family_read" ON weekly_chapters FOR SELECT USING (
  resident_contact_id IN (
    SELECT resident_contact_id FROM family_accounts WHERE user_id = auth.uid()
  )
);

-- Print jobs visible to staff
CREATE POLICY "tenant_read" ON print_jobs FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- Family accounts visible to the account owner
CREATE POLICY "own_read" ON family_accounts FOR SELECT USING (
  user_id = auth.uid()
);
