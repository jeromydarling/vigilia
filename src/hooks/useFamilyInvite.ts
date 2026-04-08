/**
 * useFamilyInvite — Send magic link invitations to family members.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from '@/components/ui/sonner';

export function useFamilyInvite() {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      email: string;
      name: string;
      residentContactId: string;
      relationship?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('vigilia-family-invite', {
        body: {
          email: params.email,
          name: params.name,
          resident_contact_id: params.residentContactId,
          tenant_id: tenantId,
          relationship: params.relationship,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['digest-recipients'] });
      toast.success('Invitation sent', {
        description: `${vars.name} will receive a magic link to access the family journal.`,
      });
    },
    onError: () => {
      toast.error('Failed to send invitation');
    },
  });
}
