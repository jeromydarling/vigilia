/**
 * useNarrativeSynthesis -- React hook for triggering narrative synthesis.
 *
 * WHAT: Provides mutation wrappers around the reflection and weekly-chapter
 *       synthesis services, with loading/error state and toast notifications.
 * WHERE: Used by VisitRitual (after save) and by admin/weekly-chapter triggers.
 * WHY: Keeps synthesis calls reactive and observable from the UI layer while
 *       the underlying services handle the LLM orchestration.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { synthesizeReflection, type SynthesizeReflectionParams } from '@/services/synthesizeReflection';
import { synthesizeWeeklyChapter, type SynthesizeWeeklyChapterParams } from '@/services/synthesizeWeeklyChapter';

/**
 * Mutation for synthesizing a reflection after a visit.
 *
 * Usage:
 *   const { synthesizeAfterVisit } = useNarrativeSynthesis();
 *   synthesizeAfterVisit.mutate({ residentContactId, residentName, visitRitual, ... });
 */
export function useNarrativeSynthesis() {
  const { tenantId } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const synthesizeAfterVisit = useMutation({
    mutationFn: async (params: Omit<SynthesizeReflectionParams, 'tenantId'>) => {
      if (!tenantId) throw new Error('No tenant context');
      return synthesizeReflection({ tenantId, ...params });
    },
    onSuccess: (reflectionText) => {
      if (reflectionText) {
        // Invalidate family reflections so any open views refresh
        queryClient.invalidateQueries({ queryKey: ['family-reflections'] });
        toast.success('Reflection composed', {
          description: 'A family reflection has been written from this visit.',
        });
      }
    },
    onError: (err) => {
      // Synthesis failure is non-critical; log but show a gentle notice
      console.error('[useNarrativeSynthesis] synthesizeAfterVisit error:', err);
      toast.error('Reflection could not be composed', {
        description: 'The visit was saved. The reflection will be retried later.',
      });
    },
  });

  const synthesizeWeekly = useMutation({
    mutationFn: async (params: Omit<SynthesizeWeeklyChapterParams, 'tenantId'>) => {
      if (!tenantId) throw new Error('No tenant context');
      return synthesizeWeeklyChapter({ tenantId, ...params });
    },
    onSuccess: (chapterText) => {
      if (chapterText) {
        queryClient.invalidateQueries({ queryKey: ['weekly-chapters'] });
        toast.success('Weekly chapter composed', {
          description: 'A new chapter has been woven from this week\'s reflections.',
        });
      }
    },
    onError: (err) => {
      console.error('[useNarrativeSynthesis] synthesizeWeekly error:', err);
      toast.error('Weekly chapter could not be composed', {
        description: 'Please try again later.',
      });
    },
  });

  return { synthesizeAfterVisit, synthesizeWeekly };
}
