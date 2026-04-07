import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { crosToast } from '@/lib/crosToast';
import { useLogAudit, computeChanges } from './useAuditLog';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';

export function useEvents(options?: { allTenants?: boolean; mineOnly?: boolean }) {
  const { tenantId } = useTenant();
  const { user } = useAuth();
  const filterByTenant = !options?.allTenants && !!tenantId;

  return useQuery({
    queryKey: ['events', filterByTenant ? tenantId : 'all', options?.mineOnly ? user?.id : 'all-users'],
    queryFn: async () => {
      if (options?.mineOnly && !user?.id) return [];

      let query = supabase
        .from('events')
        .select(`
          *,
          metros (metro)
        `)
        .is('deleted_at', null)
        .eq('is_local_pulse', false)
        .order('event_date', { ascending: false });
      
      if (filterByTenant && tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      if (options?.mineOnly && user?.id) {
        query = query.eq('attended_by', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const logAudit = useLogAudit();
  const { tenantId } = useTenant();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (event: {
      event_id: string;
      event_name: string;
      event_date: string;
      end_date?: string | null;
      metro_id?: string;
      host_opportunity_id?: string;
      event_type?: string | null;
      staff_deployed?: number;
      households_served?: number;
      devices_distributed?: number;
      internet_signups?: number;
      referrals_generated?: number;
      cost_estimated?: number;
      anchor_identified_yn?: boolean;
      followup_meeting_yn?: boolean;
      grant_narrative_value?: 'High' | 'Medium' | 'Low';
      notes?: string;
      // New fields
      city?: string | null;
      host_organization?: string | null;
      target_populations?: string[] | null;
      strategic_lanes?: string[] | null;
      pcs_goals?: string[] | null;
      priority?: string | null;
      status?: string | null;
      travel_required?: string | null;
      expected_households?: string | null;
      expected_referrals?: string | null;
      anchor_potential?: string | null;
      // Recurring fields
      is_recurring?: boolean | null;
      recurrence_pattern?: string | null;
      recurrence_end_date?: string | null;
      // Description field
      description?: string | null;
      // Conference mode
      is_conference?: boolean | null;
    }) => {
      const { data, error } = await supabase
        .from('events')
        .insert({ ...event, tenant_id: tenantId || undefined, attended_by: user?.id || undefined })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      crosToast.noted('Event recorded');
      
      // Log audit
      logAudit.mutate({
        action: 'create',
        entityType: 'event',
        entityId: data.id,
        entityName: data.event_name
      });
    },
    onError: (error) => {
      crosToast.gentle(`Something didn't go through: ${error.message}`);
    }
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const logAudit = useLogAudit();
  
  return useMutation({
    mutationFn: async ({ id, _previousData, ...event }: {
      id: string;
      _previousData?: Record<string, unknown>;
      event_name?: string;
      event_date?: string;
      end_date?: string | null;
      metro_id?: string | null;
      host_opportunity_id?: string | null;
      event_type?: string | null;
      staff_deployed?: number;
      households_served?: number;
      devices_distributed?: number;
      internet_signups?: number;
      referrals_generated?: number;
      cost_estimated?: number;
      anchor_identified_yn?: boolean;
      followup_meeting_yn?: boolean;
      grant_narrative_value?: 'High' | 'Medium' | 'Low';
      notes?: string;
      // New fields
      city?: string | null;
      host_organization?: string | null;
      target_populations?: string[] | null;
      strategic_lanes?: string[] | null;
      pcs_goals?: string[] | null;
      priority?: string | null;
      status?: string | null;
      travel_required?: string | null;
      expected_households?: string | null;
      expected_referrals?: string | null;
      anchor_potential?: string | null;
      // Recurring fields
      is_recurring?: boolean | null;
      recurrence_pattern?: string | null;
      recurrence_end_date?: string | null;
      // Description field
      description?: string | null;
      // Attended field
      attended?: boolean | null;
      // Conference mode
      is_conference?: boolean | null;
    }) => {
      const { data, error } = await supabase
        .from('events')
        .update(event)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, previousData: _previousData };
    },
    onSuccess: ({ data, previousData }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      crosToast.updated();
      
      // Log audit with changes
      const changes = previousData 
        ? computeChanges(previousData, data as Record<string, unknown>)
        : null;
      
      logAudit.mutate({
        action: 'update',
        entityType: 'event',
        entityId: data.id,
        entityName: data.event_name,
        changes: changes || undefined
      });
    },
    onError: (error) => {
      crosToast.gentle(`Something didn't go through: ${error.message}`);
    }
  });
}

export function useDuplicateEvent() {
  const queryClient = useQueryClient();
  const logAudit = useLogAudit();
  
  return useMutation({
    mutationFn: async (event: {
      event_name: string;
      event_date: string;
      metro_id?: string | null;
      host_opportunity_id?: string | null;
      event_type?: string | null;
      staff_deployed?: number | null;
      households_served?: number | null;
      devices_distributed?: number | null;
      internet_signups?: number | null;
      referrals_generated?: number | null;
      cost_estimated?: number | null;
      anchor_identified_yn?: boolean | null;
      followup_meeting_yn?: boolean | null;
      grant_narrative_value?: 'High' | 'Medium' | 'Low' | null;
      notes?: string | null;
      // New fields
      city?: string | null;
      host_organization?: string | null;
      target_populations?: string[] | null;
      strategic_lanes?: string[] | null;
      pcs_goals?: string[] | null;
      priority?: string | null;
      status?: string | null;
      travel_required?: string | null;
      expected_households?: string | null;
      expected_referrals?: string | null;
      anchor_potential?: string | null;
      // Recurring fields
      is_recurring?: boolean | null;
      recurrence_pattern?: string | null;
      recurrence_end_date?: string | null;
      // Description field
      description?: string | null;
    }) => {
      const eventId = `EVT-${Date.now()}`;
      const { data, error } = await supabase
        .from('events')
        .insert({
          event_id: eventId,
          event_name: event.event_name,
          event_date: event.event_date,
          metro_id: event.metro_id ?? undefined,
          host_opportunity_id: event.host_opportunity_id ?? undefined,
          event_type: event.event_type,
          staff_deployed: event.staff_deployed ?? undefined,
          households_served: event.households_served ?? undefined,
          devices_distributed: event.devices_distributed ?? undefined,
          internet_signups: event.internet_signups ?? undefined,
          referrals_generated: event.referrals_generated ?? undefined,
          cost_estimated: event.cost_estimated ?? undefined,
          anchor_identified_yn: event.anchor_identified_yn ?? undefined,
          followup_meeting_yn: event.followup_meeting_yn ?? undefined,
          grant_narrative_value: event.grant_narrative_value ?? undefined,
          notes: event.notes ?? undefined,
          // New fields
          city: event.city ?? undefined,
          host_organization: event.host_organization ?? undefined,
          target_populations: event.target_populations ?? undefined,
          strategic_lanes: event.strategic_lanes ?? undefined,
          pcs_goals: event.pcs_goals ?? undefined,
          priority: event.priority ?? undefined,
          status: event.status ?? undefined,
          travel_required: event.travel_required ?? undefined,
          expected_households: event.expected_households ?? undefined,
          expected_referrals: event.expected_referrals ?? undefined,
          anchor_potential: event.anchor_potential ?? undefined,
          // Recurring fields
          is_recurring: event.is_recurring ?? undefined,
          recurrence_pattern: event.recurrence_pattern ?? undefined,
          recurrence_end_date: event.recurrence_end_date ?? undefined,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      crosToast.noted('Event duplicated');
      
      // Log audit
      logAudit.mutate({
        action: 'create',
        entityType: 'event',
        entityId: data.id,
        entityName: `${data.event_name} (duplicate)`
      });
    },
    onError: (error) => {
      crosToast.gentle(`Something didn't go through: ${error.message}`);
    }
  });
}
