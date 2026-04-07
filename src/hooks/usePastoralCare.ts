/**
 * usePastoralCare — CRUD for sacramental records and chaplain assignments.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from '@/components/ui/sonner';
import type { SacramentType } from '@/types/vigilia';

export function useSacramentalRecords(residentContactId?: string) {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['sacramental-records', tenantId, residentContactId],
    queryFn: async () => {
      let query = supabase
        .from('sacramental_records')
        .select('*')
        .eq('tenant_id', tenantId!)
        .order('administered_at', { ascending: false });

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

export function useCreateSacramentalRecord() {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: {
      resident_contact_id: string;
      sacrament_type: SacramentType;
      administered_by?: string;
      administered_at?: string;
      location?: string;
      notes?: string;
      next_scheduled?: string;
    }) => {
      const { error } = await supabase.from('sacramental_records').insert({
        tenant_id: tenantId!,
        ...record,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacramental-records'] });
      toast.success('Sacramental record saved');
    },
    onError: () => {
      toast.error('Failed to save record');
    },
  });
}

export function useChaplainAssignments(facilityAnchorId?: string) {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['chaplain-assignments', tenantId, facilityAnchorId],
    queryFn: async () => {
      let query = supabase
        .from('chaplain_assignments')
        .select('*')
        .eq('tenant_id', tenantId!)
        .eq('active', true);

      if (facilityAnchorId) {
        query = query.eq('facility_anchor_id', facilityAnchorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
  });
}
