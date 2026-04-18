/**
 * useVigiliaSignals — Fetches open Vigilia companion signals for the current tenant.
 *
 * WHAT: Reads vigilia_signals for the active tenant, filtered to open status.
 * WHERE: VigiliaCompanionCard on Dashboard, Visits, Opportunities pages.
 * WHY: Surfaces gentle prompts from the Vigilia companion layer.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface VigiliaSignal {
  id: string;
  tenant_id: string;
  type: string;
  severity: string;
  context_ref: string | null;
  suggested_action: string;
  role_scope: string;
  is_hipaa_sensitive: boolean;
  status: string;
  created_at: string;
}

export function useVigiliaSignals(limit = 3) {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['vigilia-signals', tenantId],
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<VigiliaSignal[]> => {
      // STUB: vigilia_signals table does not exist
      const { data, error } = { data: [] as any[], error: null };
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useVigiliaAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ signalId, action }: { signalId: string; action: 'acted' | 'dismissed' }) => {
      // STUB: vigilia_signals table does not exist
      const { error } = { error: null };
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vigilia-signals'] });
    },
  });
}
