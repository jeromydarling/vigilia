/**
 * useParishVolunteers — Hooks for parish volunteer management and scheduling.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from '@/components/ui/sonner';

// ── Schedule Management ──

export function useVolunteerSchedules(facilityAnchorId?: string) {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['volunteer-schedules', tenantId, facilityAnchorId],
    queryFn: async () => {
      let query = supabase
        .from('eucharistic_minister_schedules')
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

export function useCreateVolunteerSchedule() {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      volunteerContactId: string;
      facilityAnchorId: string;
      dayOfWeek: number;
      timeSlot: string;
    }) => {
      const { error } = await supabase.from('eucharistic_minister_schedules').insert({
        tenant_id: tenantId!,
        volunteer_contact_id: params.volunteerContactId,
        facility_anchor_id: params.facilityAnchorId,
        day_of_week: params.dayOfWeek,
        time_slot: params.timeSlot,
        resident_assignments: [],
        active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteer-schedules'] });
      toast.success('Schedule created');
    },
  });
}

export function useDeleteVolunteerSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleId: string) => {
      const { error } = await supabase
        .from('eucharistic_minister_schedules')
        .update({ active: false })
        .eq('id', scheduleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteer-schedules'] });
      toast.success('Schedule removed');
    },
  });
}

// ── Parish Links ──

export function useParishLinks() {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['parish-links', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parish_facility_links')
        .select('*')
        .eq('tenant_id', tenantId!)
        .order('parish_name');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
  });
}

export function useCreateParishLink() {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { parishName: string; facilityAnchorId: string; relationshipType: string }) => {
      const { error } = await supabase.from('parish_facility_links').insert({
        tenant_id: tenantId!,
        parish_name: params.parishName,
        facility_anchor_id: params.facilityAnchorId,
        relationship_type: params.relationshipType,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parish-links'] });
      toast.success('Parish connected');
    },
  });
}

// ── Stats ──

export function useParishVolunteerStats() {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['parish-volunteer-stats', tenantId],
    queryFn: async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [volunteersRes, visitsRes, parishRes] = await Promise.all([
        supabase
          .from('volunteers')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId!)
          .eq('status', 'active'),
        supabase
          .from('visit_rituals')
          .select('id, resident_contact_id')
          .eq('tenant_id', tenantId!)
          .gte('visited_at', monthStart),
        supabase
          .from('parish_facility_links')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId!),
      ]);

      const visits = visitsRes.data ?? [];

      return {
        activeVolunteers: volunteersRes.count ?? 0,
        visitsThisMonth: visits.length,
        uniqueResidentsThisMonth: new Set(visits.map((v) => v.resident_contact_id)).size,
        connectedParishes: parishRes.count ?? 0,
      };
    },
    enabled: !!tenantId,
  });
}
