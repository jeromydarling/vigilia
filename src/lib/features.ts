// Feature gating — single source of truth for plan → feature mapping
// canUse(featureKey, tenantPlan, flagOverride?, activeAddOns?) → boolean

import { isFeatureInAddOn } from './addons';

type PlanKey = 'core' | 'insight' | 'story';

/** Active team capacity included per plan tier */
export const planActiveCapacity: Record<PlanKey, number> = {
  core: 50,    // Small Community — up to 50 residents
  insight: 120, // Standard — up to 120 residents
  story: 9999,  // Large Campus — unlimited
};

// Features granted by each plan tier (cumulative)
const planFeatures: Record<PlanKey, string[]> = {
  core: [
    // Vigilia Core — Small Community ($299/mo)
    'resident_story', 'visit_ritual', 'family_circle',
    'volunteer_scheduling', 'visitor_mode', 'voice_notes',
    'drift_watch', 'loneliness_detection',
    'events', 'calendar', 'reflections',
    'care_logging', 'season_summaries', 'care_completion_ritual',
    'communio_opt_in',
  ],
  insight: [
    // Vigilia Standard ($399/mo)
    'pastoral_care_tracking', 'sacramental_records',
    'chaplain_routing', 'chaplain_signals',
    'parish_coordination', 'eucharistic_routing',
    'testimonium', 'drift_detection', 'story_signals',
  ],
  story: [
    // Vigilia Large Campus ($599/mo)
    'fhir_integration', 'multi_facility_dashboard',
    'diocese_reporting', 'exec_exports', 'narrative_reporting',
  ],
};

// Plan hierarchy — each tier includes all lower tiers
const planHierarchy: PlanKey[] = ['core', 'insight', 'story'];

/**
 * Returns all features available for a given plan tier.
 */
export function getFeaturesForPlan(plan: string): string[] {
  const planIndex = planHierarchy.indexOf(plan as PlanKey);
  if (planIndex === -1) return planFeatures.core;

  const features: string[] = [];
  for (let i = 0; i <= planIndex; i++) {
    features.push(...planFeatures[planHierarchy[i]]);
  }
  return features;
}

/**
 * Check if a feature is available for a given plan + optional tenant flag override.
 *
 * @param featureKey - The feature to check
 * @param tenantPlan - The tenant's plan tier (core | insight | story)
 * @param flagOverride - Optional tenant-level flag override (from tenant_feature_flags)
 * @param activeAddOns - Optional list of purchased add-on keys
 * @returns boolean
 */
export function canUse(
  featureKey: string,
  tenantPlan: string,
  flagOverride?: boolean | null,
  activeAddOns?: string[],
): boolean {
  // If there's an explicit tenant-level override, it wins
  if (flagOverride === true) return true;
  if (flagOverride === false) return false;

  // Check plan grants
  const features = getFeaturesForPlan(tenantPlan);
  if (features.includes(featureKey)) return true;

  // Check à la carte add-ons
  if (activeAddOns?.length) {
    return isFeatureInAddOn(featureKey, activeAddOns);
  }

  return false;
}

/**
 * Returns the minimum plan required for a feature, or null if not found.
 */
export function minimumPlanFor(featureKey: string): PlanKey | null {
  for (const plan of planHierarchy) {
    if (planFeatures[plan].includes(featureKey)) {
      return plan;
    }
  }
  return null;
}
