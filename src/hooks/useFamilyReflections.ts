/**
 * useFamilyReflections — CRUD for family-facing narrative reflections.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export function useFamilyReflections(residentContactId?: string, season?: string) {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['family-reflections', tenantId, residentContactId, season],
    queryFn: async () => {
      let query = supabase
        .from('family_reflections')
        .select('*')
        .eq('tenant_id', tenantId!)
        .order('published_at', { ascending: false });

      if (residentContactId) {
        query = query.eq('resident_contact_id', residentContactId);
      }
      if (season) {
        query = query.eq('season', season);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
  });
}

export function useWeeklyChapters(residentContactId?: string) {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['weekly-chapters', tenantId, residentContactId],
    queryFn: async () => {
      let query = supabase
        .from('weekly_chapters')
        .select('*')
        .eq('tenant_id', tenantId!)
        .order('week_start', { ascending: false })
        .limit(12);

      if (residentContactId) {
        query = query.eq('resident_contact_id', residentContactId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
  });
}
