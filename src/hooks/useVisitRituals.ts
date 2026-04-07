/**
 * useVisitRituals — CRUD hook for the 30-second visit ritual.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { synthesizeReflection } from '@/services/synthesizeReflection';
import type { VisitRitualData } from '@/components/vigilia/VisitRitual';

export function useVisitRituals(residentContactId?: string) {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['visit-rituals', tenantId, residentContactId],
    queryFn: async () => {
      let query = supabase
        .from('visit_rituals')
        .select('*')
        .eq('tenant_id', tenantId!)
        .order('visited_at', { ascending: false })
        .limit(50);

      if (residentContactId) {
        query = query.eq('resident_contact_id', residentContactId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
  });
}

export function useRecentPromptIds() {
  const { tenantId } = useTenant();
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-prompt-ids', tenantId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visit_rituals')
        .select('voice_prompt_id')
        .eq('tenant_id', tenantId!)
        .eq('visitor_user_id', user!.id)
        .order('visited_at', { ascending: false })
        .limit(7);

      if (error) throw error;
      return (data ?? []).map(r => r.voice_prompt_id).filter(Boolean) as string[];
    },
    enabled: !!tenantId && !!user?.id,
  });
}

export function useCreateVisitRitual() {
  const { tenantId } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VisitRitualData & { residentName?: string; voiceTranscript?: string | null }) => {
      const { error } = await supabase.from('visit_rituals').insert({
        tenant_id: tenantId!,
        resident_contact_id: data.residentContactId,
        visitor_user_id: user!.id,
        mood_observed: data.mood,
        need_observed: data.need,
        concern_noted: data.concern,
        followup_action: data.followup,
        voice_prompt_id: data.voicePrompt.id,
        voice_prompt_text: data.voicePrompt.prompt_text,
        facility_anchor_id: data.facilityAnchorId ?? null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['visit-rituals'] });
      queryClient.invalidateQueries({ queryKey: ['recent-prompt-ids'] });
      toast.success('Visit recorded', { description: 'Thank you for your attention.' });

      // Fire-and-forget: synthesize a family reflection from this visit
      if (tenantId && data.residentName) {
        synthesizeReflection({
          tenantId,
          residentContactId: data.residentContactId,
          residentName: data.residentName,
          visitRitual: {
            mood_observed: data.mood,
            need_observed: data.need,
            concern_noted: data.concern,
            voice_prompt_text: data.voicePrompt.prompt_text,
            visited_at: new Date().toISOString(),
          },
          voiceTranscript: data.voiceTranscript ?? null,
          visitorRole: 'any',
        }).then((text) => {
          if (text) {
            queryClient.invalidateQueries({ queryKey: ['family-reflections'] });
          }
        });
      }
    },
    onError: () => {
      toast.error('Failed to save visit');
    },
  });
}
