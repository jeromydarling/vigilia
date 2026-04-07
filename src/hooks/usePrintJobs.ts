/**
 * usePrintJobs — Track Lulu print job status for seasonal journals.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export function usePrintJobs(residentContactId?: string) {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['print-jobs', tenantId, residentContactId],
    queryFn: async () => {
      let query = supabase
        .from('print_jobs')
        .select('*')
        .eq('tenant_id', tenantId!)
        .order('created_at', { ascending: false });

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
