/**
 * useMinisterSchedule — CRUD for Eucharistic minister schedules and parish links.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from '@/components/ui/sonner';

export function useMinisterSchedules(facilityAnchorId?: string) {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['minister-schedules', tenantId, facilityAnchorId],
    queryFn: async () => {
      let query = supabase
        .from('eucharistic_minister_schedules')
        .select('*')
        .eq('tenant_id', tenantId!)
        .eq('active', true)
        .order('day_of_week', { ascending: true });

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

export function useCreateMinisterSchedule() {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (schedule: {
      volunteer_contact_id: string;
      facility_anchor_id: string;
      day_of_week: number;
      time_slot?: string;
      resident_assignments?: string[];
    }) => {
      const { error } = await supabase.from('eucharistic_minister_schedules').insert({
        tenant_id: tenantId!,
        ...schedule,
        resident_assignments: schedule.resident_assignments ?? [],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minister-schedules'] });
      toast.success('Minister schedule saved');
    },
    onError: () => {
      toast.error('Failed to save schedule');
    },
  });
}

export function useParishFacilityLinks(facilityAnchorId?: string) {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['parish-facility-links', tenantId, facilityAnchorId],
    queryFn: async () => {
      let query = supabase
        .from('parish_facility_links')
        .select('*')
        .eq('tenant_id', tenantId!);

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
