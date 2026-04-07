/**
 * useDioceseReport — Aggregate spiritual care metrics for bishop/diocese reporting.
 *
 * "This turns Catholic identity from an assertion into evidence."
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { getCurrentSeason } from '@/lib/liturgicalCalendar';

export interface DioceseReportData {
  periodLabel: string;
  generatedAt: string;
  totalVisits: number;
  visitsThisSeason: number;
  uniqueResidentsVisited: number;
  uniqueVisitors: number;
  communionCount: number;
  confessionCount: number;
  anointingCount: number;
  lastRitesCount: number;
  rosaryCount: number;
  blessingCount: number;
  totalSacraments: number;
  reflectionsPublished: number;
  journalsPrinted: number;
  journalsShipped: number;
  activeVolunteers: number;
  totalResidents: number;
  avgVisitsPerResident: number;
  sacramentalCoveragePercent: number;
}

export function useDioceseReport() {
  const { tenantId } = useTenant();
  const season = getCurrentSeason();

  return useQuery({
    queryKey: ['diocese-report', tenantId, season.season],
    queryFn: async (): Promise<DioceseReportData> => {
      const startISO = season.startDate.toISOString();
      const endISO = season.endDate.toISOString();

      const [visitsRes, sacramentsRes, reflectionsRes, printRes, volunteersRes, residentsRes] = await Promise.all([
        supabase
          .from('visit_rituals')
          .select('id, resident_contact_id, visitor_user_id')
          .eq('tenant_id', tenantId!)
          .gte('visited_at', startISO)
          .lte('visited_at', endISO),
        supabase
          .from('sacramental_records')
          .select('id, sacrament_type, resident_contact_id')
          .eq('tenant_id', tenantId!)
          .gte('administered_at', startISO)
          .lte('administered_at', endISO),
        supabase
          .from('family_reflections')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId!)
          .gte('published_at', startISO)
          .lte('published_at', endISO),
        supabase
          .from('print_jobs')
          .select('id, status')
          .eq('tenant_id', tenantId!),
        supabase
          .from('volunteers')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId!)
          .eq('status', 'active'),
        supabase
          .from('contacts')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId!)
          .eq('person_type', 'resident'),
      ]);

      const visits = visitsRes.data ?? [];
      const sacraments = sacramentsRes.data ?? [];

      const uniqueResidents = new Set(visits.map((v) => v.resident_contact_id)).size;
      const uniqueVisitors = new Set(visits.map((v) => v.visitor_user_id)).size;

      const countSac = (type: string) => sacraments.filter((s) => s.sacrament_type === type).length;
      const sacResidents = new Set(sacraments.map((s) => s.resident_contact_id)).size;
      const totalResidents = residentsRes.count ?? 0;

      return {
        periodLabel: `${season.label} ${season.startDate.getFullYear()}`,
        generatedAt: new Date().toISOString(),
        totalVisits: visits.length,
        visitsThisSeason: visits.length,
        uniqueResidentsVisited: uniqueResidents,
        uniqueVisitors,
        communionCount: countSac('communion'),
        confessionCount: countSac('confession'),
        anointingCount: countSac('anointing_of_sick'),
        lastRitesCount: countSac('last_rites'),
        rosaryCount: countSac('rosary'),
        blessingCount: countSac('blessing'),
        totalSacraments: sacraments.length,
        reflectionsPublished: reflectionsRes.count ?? 0,
        journalsPrinted: (printRes.data ?? []).filter((p) => ['printing', 'shipped', 'delivered'].includes(p.status)).length,
        journalsShipped: (printRes.data ?? []).filter((p) => ['shipped', 'delivered'].includes(p.status)).length,
        activeVolunteers: volunteersRes.count ?? 0,
        totalResidents,
        avgVisitsPerResident: uniqueResidents > 0 ? Math.round((visits.length / uniqueResidents) * 10) / 10 : 0,
        sacramentalCoveragePercent: totalResidents > 0 ? Math.round((sacResidents / totalResidents) * 100) : 0,
      };
    },
    enabled: !!tenantId,
  });
}
