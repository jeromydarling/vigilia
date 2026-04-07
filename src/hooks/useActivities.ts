import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useLogAudit, computeChanges } from './useAuditLog';
import { Database } from '@/integrations/supabase/types';

type ActivityType = Database['public']['Enums']['activity_type'];
type ActivityOutcome = Database['public']['Enums']['activity_outcome'];

export interface Activity {
  id: string;
  activity_id: string;
  activity_type: ActivityType;
  activity_date_time: string;
  outcome?: ActivityOutcome | null;
  notes?: string | null;
  next_action?: string | null;
  next_action_due?: string | null;
  opportunity_id?: string | null;
  metro_id?: string | null;
  contact_id?: string | null;
  google_calendar_event_id?: string | null;
  google_calendar_synced_at?: string | null;
  attended?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  opportunities?: { organization: string; metros?: { metro: string } | null } | null;
  contacts?: { name: string; email?: string | null } | null;
  metros?: { metro: string } | null;
}

export function useActivities() {
  return useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          opportunities (organization, metros (metro)),
          contacts!contact_id (name, email),
          metros (metro)
        `)
        .order('activity_date_time', { ascending: false });
      
      if (error) throw error;
      return data as Activity[];
    }
  });
}

export function useActivitiesForCalendar(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['activities-calendar', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          opportunities (organization, metros (metro)),
          contacts!contact_id (name, email),
          metros (metro)
        `)
        .gte('activity_date_time', startDate)
        .lte('activity_date_time', endDate)
        .order('activity_date_time', { ascending: true });
      
      if (error) throw error;
      return data as Activity[];
    }
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  const logAudit = useLogAudit();
  
  return useMutation({
    mutationFn: async (activity: {
      activity_id: string;
      activity_type: ActivityType;
      activity_date_time: string;
      outcome?: ActivityOutcome | null;
      notes?: string | null;
      next_action?: string | null;
      next_action_due?: string | null;
      opportunity_id?: string | null;
      metro_id?: string | null;
      contact_id?: string | null;
      attended?: boolean | null;
      google_calendar_event_id?: string | null;
      google_calendar_synced_at?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('activities')
        .insert(activity)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activities-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-data'] });
      toast.success('Activity created successfully');
      
      logAudit.mutate({
        action: 'create',
        entityType: 'activity',
        entityId: data.id,
        entityName: `${data.activity_type} on ${new Date(data.activity_date_time).toLocaleDateString()}`
      });
    },
    onError: (error) => {
      toast.error(`Failed to create activity: ${error.message}`);
    }
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  const logAudit = useLogAudit();
  
  return useMutation({
    mutationFn: async ({ id, _previousData, ...activity }: {
      id: string;
      _previousData?: Record<string, unknown>;
      activity_type?: ActivityType;
      activity_date_time?: string;
      outcome?: ActivityOutcome | null;
      notes?: string | null;
      next_action?: string | null;
      next_action_due?: string | null;
      opportunity_id?: string | null;
      metro_id?: string | null;
      contact_id?: string | null;
      google_calendar_event_id?: string | null;
      google_calendar_synced_at?: string | null;
      attended?: boolean | null;
    }) => {
      const { data, error } = await supabase
        .from('activities')
        .update(activity)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, previousData: _previousData };
    },
    onSuccess: async ({ data, previousData }) => {
      // Force immediate refetch to ensure UI updates
      await queryClient.invalidateQueries({ queryKey: ['activities'], refetchType: 'active' });
      await queryClient.invalidateQueries({ queryKey: ['activities-calendar'], refetchType: 'active' });
      await queryClient.invalidateQueries({ queryKey: ['unified-activities'], refetchType: 'active' });
      await queryClient.invalidateQueries({ queryKey: ['calendar-data'], refetchType: 'active' });
      toast.success('Activity updated successfully');
      
      const changes = previousData 
        ? computeChanges(previousData, data as Record<string, unknown>)
        : null;
      
      logAudit.mutate({
        action: 'update',
        entityType: 'activity',
        entityId: data.id,
        entityName: `${data.activity_type} on ${new Date(data.activity_date_time).toLocaleDateString()}`,
        changes: changes || undefined
      });
    },
    onError: (error) => {
      toast.error(`Failed to update activity: ${error.message}`);
    }
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  const logAudit = useLogAudit();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activities-calendar'] });
      toast.success('Activity deleted successfully');
      
      logAudit.mutate({
        action: 'delete',
        entityType: 'activity',
        entityId: id,
        entityName: 'Activity'
      });
    },
    onError: (error) => {
      toast.error(`Failed to delete activity: ${error.message}`);
    }
  });
}
