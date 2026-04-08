-- Family memories: photos, stories, and greetings contributed by family members.
-- Makes the journal bidirectional — not just facility→family but family→resident.

CREATE TABLE IF NOT EXISTS public.family_memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  resident_contact_id UUID NOT NULL REFERENCES public.contacts(id),
  contributed_by UUID NOT NULL REFERENCES auth.users(id),
  contributor_name TEXT,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('photo', 'story', 'greeting')),
  content_text TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_family_memories_resident ON public.family_memories(tenant_id, resident_contact_id, created_at DESC);

ALTER TABLE public.family_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view memories for their tenant" ON public.family_memories
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert memories for their tenant" ON public.family_memories
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.team_members WHERE user_id = auth.uid())
    AND contributed_by = auth.uid()
  );

-- Storage bucket for family memory photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('family-memories', 'family-memories', true)
ON CONFLICT (id) DO NOTHING;
