/**
 * useFamilyDigest — Hooks for managing family digest preferences and previews.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from '@/components/ui/sonner';
import { composeFamilyDigest } from '@/services/familyDigest';

export function useFamilyDigestRecipients(residentContactId?: string) {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['digest-recipients', tenantId, residentContactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_household_members')
        .select('id, name, relationship, communication_preference, contact_frequency_preference, is_primary_contact')
        .eq('tenant_id', tenantId!)
        .eq('contact_id', residentContactId!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId && !!residentContactId,
  });
}

export function useUpdateDigestPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, frequency }: { memberId: string; frequency: string }) => {
      const { error } = await supabase
        .from('contact_household_members')
        .update({
          communication_preference: 'email',
          contact_frequency_preference: frequency,
        })
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digest-recipients'] });
      toast.success('Digest preference updated');
    },
  });
}

export function useDigestPreview(params: {
  residentContactId?: string;
  residentName: string;
  weekStart: string;
}) {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['digest-preview', tenantId, params.residentContactId, params.weekStart],
    queryFn: async () => {
      if (!tenantId || !params.residentContactId) return null;
      return composeFamilyDigest({
        tenantId,
        residentContactId: params.residentContactId,
        residentName: params.residentName,
        weekStart: params.weekStart,
      });
    },
    enabled: !!tenantId && !!params.residentContactId,
  });
}
