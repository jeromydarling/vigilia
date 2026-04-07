/**
 * useLonelinessWatch — Drift & loneliness detection for residents.
 * Queries loneliness_scores and visit_rituals to identify at-risk residents.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import type { DriftStatus } from '@/types/vigilia';

export interface ResidentDriftSummary {
  resident_contact_id: string;
  resident_name: string;
  isolation_score: number;
  drift_status: DriftStatus;
  visit_frequency_7d: number;
  mood_trend_7d: string | null;
  last_visit_at: string | null;
  days_since_visit: number;
}

export function useLonelinessScores() {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['loneliness-scores', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loneliness_scores')
        .select('*')
        .eq('tenant_id', tenantId!)
        .order('score_date', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
  });
}

export function useResidentLonelinessScore(residentContactId: string) {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['loneliness-score', tenantId, residentContactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loneliness_scores')
        .select('*')
        .eq('tenant_id', tenantId!)
        .eq('resident_contact_id', residentContactId)
        .order('score_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!residentContactId,
  });
}

/**
 * Classify drift status from days since last visit.
 * Vigilia thresholds: 3 days = quiet, 7 = drifting, 14 = distant.
 */
export function classifyDrift(daysSinceVisit: number): DriftStatus {
  if (daysSinceVisit <= 3) return 'present';
  if (daysSinceVisit <= 7) return 'quiet';
  if (daysSinceVisit <= 14) return 'drifting';
  return 'distant';
}

/** Human-readable drift label */
export function driftLabel(status: DriftStatus): string {
  switch (status) {
    case 'present': return 'Visited recently';
    case 'quiet': return 'Getting quiet';
    case 'drifting': return 'Needs attention';
    case 'distant': return 'At risk';
  }
}

/** Drift status color for UI badges */
export function driftColor(status: DriftStatus): string {
  switch (status) {
    case 'present': return 'bg-green-100 text-green-800';
    case 'quiet': return 'bg-yellow-100 text-yellow-800';
    case 'drifting': return 'bg-orange-100 text-orange-800';
    case 'distant': return 'bg-red-100 text-red-800';
  }
}
