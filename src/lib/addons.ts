/**
 * addons — À la carte add-on feature gating.
 *
 * WHAT: Defines purchasable add-ons that aren't tied to the cumulative plan hierarchy.
 * WHERE: Used alongside canUse() from features.ts for feature gating decisions.
 * WHY: Some orgs want Bridge integrations without Story exports, or campaigns without upgrading tier.
 */

export interface AddOn {
  key: string;
  label: string;
  description: string;
  /** Features unlocked by this add-on */
  features: string[];
  /** Monthly price in dollars (display only) */
  price: number;
}

export const ADD_ONS: AddOn[] = [
  {
    key: 'fhir_bridge',
    label: 'FHIR Bridge',
    description: 'Connect to PointClickCare, MatrixCare, and other clinical systems via FHIR APIs.',
    features: ['fhir_sync', 'pointclickcare', 'matrixcare'],
    price: 79,
  },
  {
    key: 'diocese_coordination',
    label: 'Diocese Coordination',
    description: 'Multi-parish volunteer coordination and diocese-level reporting.',
    features: ['parish_coordination', 'eucharistic_routing', 'diocese_reporting'],
    price: 49,
  },
  {
    key: 'capacity_expansion_50',
    label: '+50 Residents',
    description: 'Add 50 residents beyond your plan allocation.',
    features: ['capacity_expansion'],
    price: 29,
  },
  {
    key: 'capacity_expansion_150',
    label: '+150 Residents',
    description: 'Add 150 residents beyond your plan allocation.',
    features: ['capacity_expansion'],
    price: 69,
  },
];

/**
 * Check if a feature is unlocked by any of the tenant's active add-ons.
 */
export function isFeatureInAddOn(featureKey: string, activeAddOnKeys: string[]): boolean {
  return ADD_ONS.some(
    addon => activeAddOnKeys.includes(addon.key) && addon.features.includes(featureKey),
  );
}

/**
 * Get the add-on that provides a feature, if any.
 */
export function getAddOnForFeature(featureKey: string): AddOn | null {
  return ADD_ONS.find(addon => addon.features.includes(featureKey)) ?? null;
}
