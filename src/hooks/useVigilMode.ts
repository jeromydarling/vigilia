/**
 * useVigilMode — End-of-life care mode for residents.
 *
 * Vigil Mode activates when a resident enters their final days (care_level = 'hospice').
 * It heightens pastoral attention, increases family communication, and
 * prepares the memorial journal.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { getCurrentSeason } from '@/lib/liturgicalCalendar';

export function useVigilMode(residentContactId?: string) {
  const { tenantId } = useTenant();

  const isVigilActive = useQuery({
    queryKey: ['vigil-mode', tenantId, residentContactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('care_level')
        .eq('id', residentContactId!)
        .eq('tenant_id', tenantId!)
        .maybeSingle();
      if (error) throw error;
      return data?.care_level === 'hospice';
    },
    enabled: !!tenantId && !!residentContactId,
  });

  return isVigilActive;
}

export function useActivateVigilMode() {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (residentContactId: string) => {
      const { error } = await supabase
        .from('contacts')
        .update({ care_level: 'hospice' })
        .eq('id', residentContactId)
        .eq('tenant_id', tenantId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vigil-mode'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Vigil Mode activated', {
        description: 'Enhanced pastoral care and family communication are now active.',
      });
    },
  });
}

export function useDeactivateVigilMode() {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (residentContactId: string) => {
      const { error } = await supabase
        .from('contacts')
        .update({ care_level: 'skilled_nursing' })
        .eq('id', residentContactId)
        .eq('tenant_id', tenantId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vigil-mode'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Vigil Mode deactivated');
    },
  });
}

export function useVigilResidents() {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['vigil-residents', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, slug, room_number, care_level')
        .eq('tenant_id', tenantId!)
        .eq('care_level', 'hospice')
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
  });
}

export function useSendFamilyMessage() {
  const { tenantId } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentContactId, message }: { residentContactId: string; message: string }) => {
      const season = getCurrentSeason();
      const { error } = await supabase.from('family_reflections').insert({
        tenant_id: tenantId!,
        resident_contact_id: residentContactId,
        reflection_text: message,
        reflection_type: 'family_message',
        season: season.season,
        is_print_candidate: true,
        published_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-reflections'] });
      toast.success('Message sent to family journal');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });
}
