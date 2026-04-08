/**
 * useHeldReflections — Manage reflections that failed quality validation.
 *
 * Held reflections are visible to facility admins (leadership role) —
 * NOT the platform operator. The facility decides what to do:
 * approve (publish as-is), edit and publish, or discard.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from '@/components/ui/sonner';

export function useHeldReflections() {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['held-reflections', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('family_reflections')
        .select('*, contacts!family_reflections_resident_contact_id_fkey(name)')
        .eq('tenant_id', tenantId!)
        .eq('reflection_type', 'held')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
  });
}

export function useApproveReflection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, editedText }: { id: string; editedText?: string }) => {
      const updates: Record<string, unknown> = {
        reflection_type: 'immediate',
        published_at: new Date().toISOString(),
      };
      if (editedText) updates.reflection_text = editedText;

      const { error } = await supabase
        .from('family_reflections')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['held-reflections'] });
      queryClient.invalidateQueries({ queryKey: ['family-reflections'] });
      toast.success('Reflection approved and published');
    },
  });
}

export function useDiscardReflection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('family_reflections')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['held-reflections'] });
      toast.success('Reflection discarded');
    },
  });
}
