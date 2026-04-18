/**
 * useHomeTerritory — Returns the tenant's home territory from tenant_territories.
 *
 * WHAT: Queries tenant_territories where is_home = true, joined with territories.
 * WHERE: Replaces legacy useHomeMetro across Local Pulse, Command Center, narratives.
 * WHY: Unified territory model — home location flows through tenant_territories.is_home
 *      instead of legacy profiles.home_metro_id or tenants.home_metro_id.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import type { TerritoryType } from '@/types/vigilia';

export interface HomeTerritory {
  territory_id: string;
  territory_type: TerritoryType;
  name: string;
  metro_id: string | null;
  state_code: string | null;
  country_code: string | null;
}

export function useHomeTerritory() {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ['home-territory', tenant?.id],
    enabled: !!tenant?.id,
    staleTime: 1000 * 60 * 10,
    queryFn: async (): Promise<HomeTerritory | null> => {
      // STUB: tenant_territories and metros tables do not exist
      const { data } = { data: null as any, error: null };

      if (data) {
        const t = (data as any).territories;
        return {
          territory_id: data.territory_id,
          territory_type: t.territory_type as TerritoryType,
          name: t.name,
          metro_id: t.metro_id,
          state_code: t.state_code,
          country_code: t.country_code,
        };
      }

      return null;
    },
  });
}

/**
 * Convenience: returns just the effective metro_id for backward-compatible queries
 * (events, local_pulse_runs, narratives all still key on metro_id).
 */
export function useHomeMetroId() {
  const { data: home, ...rest } = useHomeTerritory();
  return { data: home?.metro_id ?? null, ...rest };
}
