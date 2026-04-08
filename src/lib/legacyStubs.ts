/**
 * legacyStubs — Stub exports for legacy CROS features removed in Vigilia.
 *
 * These exist because the import was commented out but the usage wasn't.
 * Each returns a no-op / empty value so the app doesn't crash.
 */

// Hooks
export function useGrantAlignments() { return { data: [] }; }
export function useProvisionMode() { return { enabled: false }; }
export function useProvisions() { return { data: [] }; }
export function useOpportunities() { return { data: [] }; }
export function useCreateEventFollowupCampaign() { return { mutate: () => {}, isPending: false }; }
export function useImpulsusCapture() { return { capture: () => {} }; }
export function useCreateCampaignFromImport() { return { mutate: () => {} }; }
export function useMetros() { return { data: [] }; }
export function useMetrosWithComputed() { return { data: [] }; }
export function useCreateMetro() { return { mutate: () => {} }; }
export function useUpdateMetro() { return { mutate: () => {} }; }
export function useDeleteMetro() { return { mutate: () => {} }; }
export type MetroWithComputed = any;

// Utility functions
export function downloadTechnicalDocPdf() {}
export function generateOpportunityCardsPdf() {}
export function getIntegrationVoice() { return ''; }
export function computeDensity() { return 0; }
export const DENSITY_THRESHOLDS = [];
export function calculateOrderScore() { return 0; }
export type OpportunityOrderSignals = any;
export function getMovementWindow() { return null; }
export function logPerformanceWarning() {}
