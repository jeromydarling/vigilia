import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { crosToast } from '@/lib/crosToast';
import { useLogAudit, computeChanges } from './useAuditLog';
import { useImpulsusCapture } from './useImpulsusCapture';

export function useOpportunities() {
  return useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          metros (metro),
          primary_contact:contacts!opportunities_primary_contact_id_fkey (
            id,
            slug,
            name,
            title,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  const logAudit = useLogAudit();
  
  return useMutation({
    mutationFn: async (opportunity: {
      opportunity_id: string;
      organization: string;
      metro_id?: string;
      stage?: 'Target Identified' | 'Contacted' | 'Discovery Scheduled' | 'Discovery Held' | 'Proposal Sent' | 'Agreement Pending' | 'Agreement Signed' | 'First Volume' | 'Stable Producer' | 'Closed - Not a Fit';
      status?: 'Active' | 'On Hold' | 'Closed - Won' | 'Closed - Lost';
      partner_tier?: 'Anchor' | 'Distribution' | 'Referral' | 'Workforce' | 'Housing' | 'Education' | 'Other';
      partner_tiers?: string[];
      grant_alignment?: string[];
      mission_snapshot?: string[];
      best_partnership_angle?: string[];
      primary_contact_id?: string | null;
      primary_contact_name?: string;
      primary_contact_title?: string;
      primary_contact_email?: string;
      primary_contact_phone?: string;
      next_action_due?: string;
      next_step?: string;
      notes?: string;
      website_url?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('opportunities')
        .insert(opportunity)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      crosToast.noted('Partner added');
      
      // Log audit
      logAudit.mutate({
        action: 'create',
        entityType: 'opportunity',
        entityId: data.id,
        entityName: data.organization
      });
    },
    onError: (error) => {
      crosToast.gentle(`Something didn't go through: ${error.message}`);
    }
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();
  const logAudit = useLogAudit();
  const { captureImpulsus } = useImpulsusCapture();
  
  return useMutation({
    mutationFn: async ({ id, _previousData, ...opportunity }: {
      id: string;
      _previousData?: Record<string, unknown>;
      organization?: string;
      metro_id?: string | null;
      stage?: 'Target Identified' | 'Contacted' | 'Discovery Scheduled' | 'Discovery Held' | 'Proposal Sent' | 'Agreement Pending' | 'Agreement Signed' | 'First Volume' | 'Stable Producer' | 'Closed - Not a Fit';
      status?: 'Active' | 'On Hold' | 'Closed - Won' | 'Closed - Lost';
      partner_tier?: 'Anchor' | 'Distribution' | 'Referral' | 'Workforce' | 'Housing' | 'Education' | 'Other';
      partner_tiers?: string[];
      grant_alignment?: string[];
      mission_snapshot?: string[];
      best_partnership_angle?: string[];
      primary_contact_id?: string | null;
      primary_contact_name?: string;
      primary_contact_title?: string;
      primary_contact_email?: string;
      primary_contact_phone?: string;
      next_action_due?: string | null;
      next_step?: string;
      notes?: string;
      website_url?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('opportunities')
        .update(opportunity)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, previousData: _previousData };
    },
    onSuccess: ({ data, previousData }) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      crosToast.updated();
      
      // Log audit with changes
      const changes = previousData 
        ? computeChanges(previousData, data as Record<string, unknown>)
        : null;
      
      logAudit.mutate({
        action: 'update',
        entityType: 'opportunity',
        entityId: data.id,
        entityName: data.organization,
        changes: changes || undefined
      });

      // Capture journey stage change
      const oldStage = previousData?.stage as string | undefined;
      const newStage = data.stage as string | undefined;
      if (oldStage && newStage && oldStage !== newStage) {
        const ts = new Date().toISOString();
        captureImpulsus({
          kind: 'journey',
          opportunityId: data.id,
          metroId: data.metro_id || undefined,
          dedupeKey: `journey:${data.id}:${oldStage}->${newStage}:${ts}`,
          source: { from_stage: oldStage, to_stage: newStage },
          context: { orgName: data.organization, fromStage: oldStage, toStage: newStage },
        });
      }
    },
    onError: (error) => {
      crosToast.gentle(`Something didn't go through: ${error.message}`);
    }
  });
}
