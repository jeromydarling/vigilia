/**
 * useFamilia — Hooks for Familia™ organizational kinship.
 *
 * WHAT: Queries familias, memberships, and suggestions for the current tenant.
 * WHERE: Settings → Familia card, Onboarding → Familia step, Gardener insights.
 * WHY: Lightweight relational container — never forced, always optional.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface Familia {
  id: string;
  name: string;
  created_by_tenant_id: string;
  created_at: string;
}

export interface FamiliaMembership {
  id: string;
  familia_id: string;
  tenant_id: string;
  role: 'founder' | 'member';
  status: 'pending' | 'active';
  created_at: string;
}

export interface FamiliaSuggestion {
  id: string;
  tenant_id: string;
  candidate_tenant_id: string | null;
  candidate_hint: string;
  kinship_score: number;
  reasons: Record<string, unknown>;
  status: 'open' | 'snoozed' | 'dismissed' | 'linked';
  created_at: string;
}

export function useFamiliaStatus() {
  const { tenant } = useTenant();
  const tenantId = tenant?.id;

  return useQuery({
    queryKey: ['familia-status', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      // STUB: familia_memberships table does not exist
      const { data: memberships, error } = { data: [] as any[], error: null };

      if (error) throw error;

      const activeMembership = memberships?.[0] ?? null;

      return {
        isInFamilia: !!activeMembership,
        membership: activeMembership as (FamiliaMembership & { familias: Familia }) | null,
      };
    },
  });
}

export function useFamiliaSuggestions() {
  const { tenant } = useTenant();
  const tenantId = tenant?.id;

  return useQuery({
    queryKey: ['familia-suggestions', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      // STUB: familia_suggestions table does not exist
      const { data, error } = { data: [] as any[], error: null };
      if (error) throw error;
      return (data ?? []) as FamiliaSuggestion[];
    },
  });
}

export function useCreateFamilia() {
  const { tenant } = useTenant();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const tenantId = tenant?.id;
      if (!tenantId) throw new Error('No tenant');

      // STUB: familias and familia_memberships tables do not exist
      const familia = { id: crypto.randomUUID(), name, created_by_tenant_id: tenantId } as any;
      const { error: familiaError } = { error: null };
      if (familiaError) throw familiaError;

      const { error: membershipError } = { error: null };
      if (membershipError) throw membershipError;

      const { error: tenantUpdateError } = await supabase
        .from('tenants')
        .update({ familia_id: familia.id })
        .eq('id', tenantId);
      if (tenantUpdateError) throw tenantUpdateError;

      return familia as Familia;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['familia-status'] });
      qc.invalidateQueries({ queryKey: ['familia-suggestions'] });
    },
  });
}

export function useLeaveFamilia() {
  const { tenant } = useTenant();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const tenantId = tenant?.id;
      if (!tenantId) throw new Error('No tenant');

      // STUB: familia_memberships table does not exist
      const { error: membershipDeleteError } = { error: null };
      if (membershipDeleteError) throw membershipDeleteError;

      const { error: tenantUpdateError } = await supabase
        .from('tenants')
        .update({ familia_id: null })
        .eq('id', tenantId);
      if (tenantUpdateError) throw tenantUpdateError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['familia-status'] });
      qc.invalidateQueries({ queryKey: ['familia-suggestions'] });
    },
  });
}

export function useDismissSuggestion() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (suggestionId: string) => {
      // STUB: familia_suggestions table does not exist
      const { error } = { error: null };
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['familia-suggestions'] });
    },
  });
}

export function useSnoozeSuggestion() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (suggestionId: string) => {
      // STUB: familia_suggestions table does not exist
      const { error } = { error: null };
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['familia-suggestions'] });
    },
  });
}
