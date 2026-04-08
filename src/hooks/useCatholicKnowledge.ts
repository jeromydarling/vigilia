/**
 * useCatholicKnowledge — Query the Catholic health knowledge base.
 *
 * Used by synthesis prompts (contextual guidance), diocese reports (citations),
 * and alignment scoring (compliance checks).
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface KnowledgeEntry {
  id: string;
  source: string;
  source_reference: string | null;
  topic: string;
  title: string;
  content: string;
  application_note: string | null;
  relevance_tags: string[];
}

export function useCatholicKnowledge(topic?: string) {
  return useQuery({
    queryKey: ['catholic-knowledge', topic],
    queryFn: async () => {
      let query = supabase
        .from('catholic_health_knowledge')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (topic) query = query.eq('topic', topic);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as KnowledgeEntry[];
    },
  });
}

export function useKnowledgeByTags(tags: string[]) {
  return useQuery({
    queryKey: ['catholic-knowledge-tags', tags],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catholic_health_knowledge')
        .select('*')
        .eq('active', true)
        .overlaps('relevance_tags', tags);

      if (error) throw error;
      return (data ?? []) as KnowledgeEntry[];
    },
    enabled: tags.length > 0,
  });
}

/**
 * Fetch knowledge entries server-side (for use in synthesis services).
 * Returns relevant guidance text for a given context.
 */
export async function fetchKnowledgeContext(params: {
  topic?: string;
  tags?: string[];
  limit?: number;
}): Promise<string> {
  let query = supabase
    .from('catholic_health_knowledge')
    .select('title, content, source_reference, application_note')
    .eq('active', true)
    .order('sort_order')
    .limit(params.limit ?? 5);

  if (params.topic) query = query.eq('topic', params.topic);
  if (params.tags?.length) query = query.overlaps('relevance_tags', params.tags);

  const { data } = await query;
  if (!data || data.length === 0) return '';

  return data.map((entry: any) =>
    `[${entry.source_reference ?? 'Guidance'}] ${entry.title}: ${entry.content}${entry.application_note ? ` (Application: ${entry.application_note})` : ''}`
  ).join('\n\n');
}
