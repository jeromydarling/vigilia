-- Catholic Health Knowledge Base — curated reference content from ERDs, CHA, and canonical sources.
-- Used by synthesis prompts, diocese reports, and alignment scoring.

CREATE TABLE IF NOT EXISTS public.catholic_health_knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,              -- 'erd_7th_edition', 'cha_essential_services', 'cha_identity', 'cha_spiritual_survey', 'canon_law', 'custom'
  source_reference TEXT,             -- e.g. 'Directive 56', 'Part Five Preamble', 'Essential Service 3.2'
  topic TEXT NOT NULL,               -- 'sacramental_care', 'end_of_life', 'family_engagement', 'catholic_identity', 'spiritual_care', 'pastoral_documentation', 'dignity', 'palliative_care'
  title TEXT NOT NULL,
  content TEXT NOT NULL,             -- The actual directive/guidance text
  application_note TEXT,             -- How Vigilia applies this (practical guidance for the app)
  relevance_tags TEXT[] DEFAULT '{}', -- Additional tags for search: ['communion', 'hospice', 'anointing', etc.]
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chk_topic ON public.catholic_health_knowledge(topic, active);
CREATE INDEX idx_chk_source ON public.catholic_health_knowledge(source);
CREATE INDEX idx_chk_tags ON public.catholic_health_knowledge USING GIN(relevance_tags);

-- No RLS — this is reference data, readable by all authenticated users
ALTER TABLE public.catholic_health_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read knowledge base" ON public.catholic_health_knowledge
  FOR SELECT USING (auth.role() = 'authenticated');

-- Operator can manage
CREATE POLICY "Admins can manage knowledge base" ON public.catholic_health_knowledge
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.team_members WHERE user_id = auth.uid() AND role = 'admin')
  );
