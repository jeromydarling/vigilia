import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { isDemoProxyActive } from '@/lib/demoWriteProxy';
import { crosToast } from '@/lib/crosToast';
import { useLogAudit, computeChanges } from './useAuditLog';

export function useContacts() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          opportunities!contacts_opportunity_id_fkey (
            organization,
            slug,
            stage,
            partner_tiers,
            mission_snapshot,
            best_partnership_angle,
            grant_alignment,
            metro_id,
            metros (
              metro,
              regions (name)
            )
          ),
        events:met_at_event_id (id, slug, event_name, event_date)
      `)
      .order('updated_at', { ascending: false });
    
      if (error) throw error;
      return data;
    }
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  const logAudit = useLogAudit();
  
  return useMutation({
    mutationFn: async (contact: {
      contact_id: string;
      opportunity_id?: string;
      name: string;
      title?: string;
      email?: string;
      phone?: string;
      is_primary?: boolean;
      notes?: string;
      met_at_event_id?: string;
      person_type?: string;
      is_person_in_need?: boolean;
    }) => {
      // If setting as primary, clear primary from other contacts and update opportunity FK
      if (contact.is_primary && contact.opportunity_id) {
        await supabase
          .from('contacts')
          .update({ is_primary: false })
          .eq('opportunity_id', contact.opportunity_id)
          .eq('is_primary', true);
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert(contact)
        .select()
        .single();
      
      if (error) throw error;

      // Sync primary_contact_id on the opportunity
      if (contact.is_primary && contact.opportunity_id) {
        await supabase
          .from('opportunities')
          .update({ primary_contact_id: data.id })
          .eq('id', contact.opportunity_id);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      crosToast.noted('Person added');
      
      // Skip audit logging in demo mode (data is a fake proxy response)
      if (!data?.id || isDemoProxyActive()) return;
      
      // Log audit
      logAudit.mutate({
        action: 'create',
        entityType: 'contact',
        entityId: data.id,
        entityName: data.name
      });
    },
    onError: (error) => {
      crosToast.gentle(`Something didn't go through: ${error.message}`);
    }
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  const logAudit = useLogAudit();
  
  return useMutation({
    mutationFn: async ({ id, _previousData, ...contact }: {
      id: string;
      _previousData?: Record<string, unknown>;
      name?: string;
      title?: string;
      email?: string;
      phone?: string;
      opportunity_id?: string | null;
      is_primary?: boolean;
      notes?: string;
      met_at_event_id?: string | null;
      person_type?: string;
      is_person_in_need?: boolean;
    }) => {
      // If setting as primary, clear primary from other contacts and update opportunity FK
      const oppId = contact.opportunity_id ?? (_previousData?.opportunity_id as string | null);
      if (contact.is_primary && oppId) {
        await supabase
          .from('contacts')
          .update({ is_primary: false })
          .eq('opportunity_id', oppId)
          .eq('is_primary', true)
          .neq('id', id);

        await supabase
          .from('opportunities')
          .update({ primary_contact_id: id })
          .eq('id', oppId);
      }

      const { data, error } = await supabase
        .from('contacts')
        .update(contact)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, previousData: _previousData };
    },
    onSuccess: ({ data, previousData }) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      crosToast.updated();
      
      // Skip audit logging in demo mode
      if (!data?.id || isDemoProxyActive()) return;
      
      // Log audit with changes
      const changes = previousData 
        ? computeChanges(previousData, data as Record<string, unknown>)
        : null;
      
      logAudit.mutate({
        action: 'update',
        entityType: 'contact',
        entityId: data.id,
        entityName: data.name,
        changes: changes || undefined
      });
    },
    onError: (error) => {
      crosToast.gentle(`Something didn't go through: ${error.message}`);
    }
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  const logAudit = useLogAudit();
  
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      // In demo mode, skip the entire delete flow — proxy already intercepted the write
      if (isDemoProxyActive()) {
        return { id, name, __demo: true };
      }

      // If deleting a primary contact, clear the FK on the opportunity and promote next contact
      const { data: contact } = await supabase
        .from('contacts')
        .select('opportunity_id, is_primary')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      // If was primary, find another contact to promote or clear the FK
      if (contact?.is_primary && contact?.opportunity_id) {
        const { data: nextPrimary } = await supabase
          .from('contacts')
          .select('id')
          .eq('opportunity_id', contact.opportunity_id)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (nextPrimary) {
          await supabase.from('contacts').update({ is_primary: true }).eq('id', nextPrimary.id);
          await supabase.from('opportunities').update({ primary_contact_id: nextPrimary.id }).eq('id', contact.opportunity_id);
        } else {
          await supabase.from('opportunities').update({ primary_contact_id: null }).eq('id', contact.opportunity_id);
        }
      }

      return { id, name };
    },
    onSuccess: (result) => {
      // Demo mode: skip misleading "Removed" toast and audit log (BT-004)
      if ('__demo' in result && result.__demo) {
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      crosToast.removed();
      
      logAudit.mutate({
        action: 'delete',
        entityType: 'contact',
        entityId: result.id,
        entityName: result.name
      });
    },
    onError: (error) => {
      crosToast.gentle(`Something didn't go through: ${error.message}`);
    }
  });
}
