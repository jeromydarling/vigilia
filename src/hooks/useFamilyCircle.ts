/**
 * useFamilyCircle — Extended family relationship management for Vigilia.
 * Builds on the existing useHouseholdMembers hook with strain signal detection.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export function useFamilyStrainSignals(residentContactId?: string) {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['family-strain-signals', tenantId, residentContactId],
    queryFn: async () => {
      let query = supabase
        .from('family_strain_signals')
        .select('*')
        .eq('tenant_id', tenantId!)
        .order('observed_at', { ascending: false });

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

export function useCreateFamilyStrainSignal() {
  const { tenantId } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (signal: {
      resident_contact_id: string;
      family_relationship_id?: string;
      signal_type: string;
      severity: 'low' | 'medium' | 'high';
      notes?: string;
    }) => {
      const { error } = await supabase.from('family_strain_signals').insert({
        tenant_id: tenantId!,
        observed_by: user!.id,
        ...signal,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-strain-signals'] });
      toast.success('Family strain signal recorded');
    },
    onError: () => {
      toast.error('Failed to save signal');
    },
  });
}
